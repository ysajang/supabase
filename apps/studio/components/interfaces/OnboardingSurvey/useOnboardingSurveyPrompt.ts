import { LOCAL_STORAGE_KEYS } from 'common'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import type {
  OnboardingSurveyPromptState,
  OnboardingSurveySurface,
  OnboardingSurveyVariant,
} from './OnboardingSurvey.constants'
import {
  ONBOARDING_SURVEY_EXPERIMENT_ID,
  variantMatchesSurface,
} from './OnboardingSurvey.constants'
import { useOnboardingSurveyMutation } from '@/data/organizations/onboarding-survey-mutation'
import { useLocalStorageQuery } from '@/hooks/misc/useLocalStorage'
import { useSelectedOrganizationQuery } from '@/hooks/misc/useSelectedOrganization'
import { useSelectedProjectQuery } from '@/hooks/misc/useSelectedProject'
import { useTrackExperimentExposure } from '@/hooks/misc/useTrackExperimentExposure'
import { usePHFlag } from '@/hooks/ui/useFlag'
import { useProfile } from '@/lib/profile'
import { useTrack } from '@/lib/telemetry/track'

type SurveyValues = {
  kind?: string
  size?: string
  heard_from?: string
  building?: string
}

type SubmitSurveyOptions = {
  showSuccessToast?: boolean
}

type DismissReason =
  | 'skip_button'
  | 'dialog_dismissed'
  | 'toast_skip'
  | 'org_form_blank'
  | 'close_button'

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
  const track = useTrack()
  const { profile } = useProfile()
  const { data: organization } = useSelectedOrganizationQuery()
  const { data: project } = useSelectedProjectQuery()
  const [open, setOpen] = useState(false)
  const hasTrackedShown = useRef(false)

  const flagValue = usePHFlag<OnboardingSurveyVariant | false>(ONBOARDING_SURVEY_EXPERIMENT_ID)
  const variant: OnboardingSurveyVariant | undefined =
    typeof flagValue === 'string' ? flagValue : undefined

  useTrackExperimentExposure(ONBOARDING_SURVEY_EXPERIMENT_ID, variant)

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

  const shouldShowPrompt =
    isPromptStateLoaded &&
    !!orgSlug &&
    !!projectRef &&
    !!profileId &&
    promptState === null &&
    variantMatchesSurface(variant, surface)

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

      setPromptState({
        status: 'dismissed',
        updatedAt: new Date().toISOString(),
      })
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
      { kind, size, heard_from, building }: SurveyValues,
      { showSuccessToast = true }: SubmitSurveyOptions = {}
    ) => {
      if (!orgSlug) return false

      try {
        await mutation.mutateAsync({
          slug: orgSlug,
          kind,
          size,
          heard_from,
          building,
        })

        setPromptState({
          status: 'submitted',
          updatedAt: new Date().toISOString(),
        })
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
    variant,
  }
}
