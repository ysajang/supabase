import { LOCAL_STORAGE_KEYS } from 'common'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import type {
  OnboardingSurveyPromptState,
  OnboardingSurveySurface,
} from './OnboardingSurvey.constants'
import {
  getOnboardingSurveyPromptOverride,
  ONBOARDING_SURVEY_PROMPT_QUERY_PARAM,
  shouldForceOnboardingSurveyPrompt,
} from './OnboardingSurvey.constants'
import { useOnboardingSurveyMutation } from '@/data/organizations/onboarding-survey-mutation'
import { useLocalStorageQuery } from '@/hooks/misc/useLocalStorage'
import { useSelectedOrganizationQuery } from '@/hooks/misc/useSelectedOrganization'
import { useSelectedProjectQuery } from '@/hooks/misc/useSelectedProject'
import { useProfile } from '@/lib/profile'
import { useTrack } from '@/lib/telemetry/track'

type SurveyValues = {
  heard_from?: string
  building?: string
}

type SubmitSurveyOptions = {
  showSuccessToast?: boolean
}

type DismissReason = 'skip_button' | 'dialog_dismissed' | 'toast_skip' | 'close_button'

export const getOnboardingSurveyPromptStorageKey = ({
  orgSlug,
  profileId,
}: {
  orgSlug?: string
  profileId?: string | number
}) => {
  if (!orgSlug || profileId === undefined || profileId === null) {
    return 'supabase-onboarding-survey-unknown'
  }

  return LOCAL_STORAGE_KEYS.ONBOARDING_SURVEY_PROMPT_STATE(String(profileId), orgSlug)
}

export function useOnboardingSurveyPrompt({ surface }: { surface: OnboardingSurveySurface }) {
  const router = useRouter()
  const track = useTrack()
  const { profile } = useProfile()
  const { data: organization } = useSelectedOrganizationQuery()
  const { data: project } = useSelectedProjectQuery()
  const [open, setOpen] = useState(false)
  const hasTrackedShown = useRef(false)

  const profileId = profile?.gotrue_id ?? profile?.id
  const orgSlug = organization?.slug
  const projectRef = project?.ref

  const storageKey = useMemo(
    () => getOnboardingSurveyPromptStorageKey({ orgSlug, profileId }),
    [orgSlug, profileId]
  )

  const [promptState, setPromptState, { isSuccess: isPromptStateLoaded }] =
    useLocalStorageQuery<OnboardingSurveyPromptState | null>(storageKey, null)

  const mutation = useOnboardingSurveyMutation()
  const promptOverride = getOnboardingSurveyPromptOverride(
    router.query[ONBOARDING_SURVEY_PROMPT_QUERY_PARAM]
  )
  const isForcedPrompt = shouldForceOnboardingSurveyPrompt({ override: promptOverride, surface })

  const shouldShowPrompt =
    isPromptStateLoaded &&
    !!orgSlug &&
    !!projectRef &&
    !!profileId &&
    (promptState === null || isForcedPrompt)

  useEffect(() => {
    if (!shouldShowPrompt || hasTrackedShown.current) return

    hasTrackedShown.current = true
    track('onboarding_survey_prompt_shown', {
      surface,
      orgSlug,
      projectRef,
    })
  }, [orgSlug, projectRef, shouldShowPrompt, surface, track])

  const openDialog = useCallback(() => {
    if (!shouldShowPrompt) return

    setOpen(true)
    track('onboarding_survey_dialog_opened', {
      surface,
      orgSlug,
      projectRef,
    })
  }, [orgSlug, projectRef, shouldShowPrompt, surface, track])

  const dismissPrompt = useCallback(
    (reason: DismissReason = 'dialog_dismissed') => {
      if (!shouldShowPrompt) {
        setOpen(false)
        return
      }

      setPromptState({ status: 'dismissed', updatedAt: new Date().toISOString() })
      setOpen(false)
      track('onboarding_survey_skipped', {
        surface,
        orgSlug,
        projectRef,
        reason,
      })
    },
    [orgSlug, projectRef, setPromptState, shouldShowPrompt, surface, track]
  )

  const submitSurvey = useCallback(
    async (
      { heard_from, building }: SurveyValues,
      { showSuccessToast = true }: SubmitSurveyOptions = {}
    ) => {
      if (!orgSlug) return false

      try {
        await mutation.mutateAsync({
          slug: orgSlug,
          heard_from,
          building,
        })

        setPromptState({ status: 'submitted', updatedAt: new Date().toISOString() })
        setOpen(false)
        track('onboarding_survey_submitted', {
          surface,
          orgSlug,
          projectRef,
          hasHeardFrom: !!heard_from?.trim(),
          hasBuilding: !!building?.trim(),
        })
        if (showSuccessToast) toast.success('Thanks for sharing')
        return true
      } catch {
        track('onboarding_survey_submit_failed', {
          surface,
          orgSlug,
          projectRef,
          hasHeardFrom: !!heard_from?.trim(),
          hasBuilding: !!building?.trim(),
        })
        toast.error('Failed to submit. Please try again.')
        return false
      }
    },
    [mutation, orgSlug, projectRef, setPromptState, surface, track]
  )

  return {
    dismissPrompt,
    isSubmitting: mutation.isPending,
    open,
    openDialog,
    setOpen,
    shouldShowPrompt,
    submitSurvey,
  }
}
