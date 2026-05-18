import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { OnboardingSurveyVariant } from './OnboardingSurvey.constants'
import { useOnboardingSurveyPrompt } from './useOnboardingSurveyPrompt'

type PromptState = {
  status: 'submitted' | 'dismissed'
  updatedAt: string
} | null
type OrganizationState = { slug: string } | undefined
type ProfileState = { gotrue_id?: string; id?: number } | undefined
type ProjectState = { ref: string } | undefined

const {
  flagState,
  localStorageState,
  mockMutateAsync,
  mockSetLocalStorageState,
  mockTrack,
  mockTrackExperimentExposure,
  organizationState,
  profileState,
  projectState,
} = vi.hoisted(() => ({
  flagState: {
    current: 'org_form_collapsible' as OnboardingSurveyVariant | false | undefined,
  },
  localStorageState: { current: null as PromptState },
  mockMutateAsync: vi.fn(),
  mockSetLocalStorageState: vi.fn((value: PromptState | ((state: PromptState) => PromptState)) => {
    localStorageState.current = value instanceof Function ? value(localStorageState.current) : value
  }),
  mockTrack: vi.fn(),
  mockTrackExperimentExposure: vi.fn(),
  organizationState: { current: { slug: 'test-org' } as OrganizationState },
  profileState: { current: { gotrue_id: 'user-1', id: 1 } as ProfileState },
  projectState: { current: { ref: 'project-ref' } as ProjectState },
}))

vi.mock('common', () => ({
  LOCAL_STORAGE_KEYS: {
    ONBOARDING_SURVEY_PROMPT_STATE: (profileId: string, orgSlug: string) =>
      `survey-${profileId}-${orgSlug}`,
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('@/data/organizations/onboarding-survey-mutation', () => ({
  useOnboardingSurveyMutation: () => ({
    isPending: false,
    mutateAsync: mockMutateAsync,
  }),
}))

vi.mock('@/hooks/misc/useLocalStorage', () => ({
  useLocalStorageQuery: () => [
    localStorageState.current,
    mockSetLocalStorageState,
    { isSuccess: true },
  ],
}))

vi.mock('@/hooks/misc/useSelectedOrganization', () => ({
  useSelectedOrganizationQuery: () => ({ data: organizationState.current }),
}))

vi.mock('@/hooks/misc/useSelectedProject', () => ({
  useSelectedProjectQuery: () => ({ data: projectState.current }),
}))

vi.mock('@/hooks/misc/useTrackExperimentExposure', () => ({
  useTrackExperimentExposure: (id: string, variant: string | undefined) =>
    mockTrackExperimentExposure(id, variant),
}))

vi.mock('@/hooks/ui/useFlag', () => ({
  usePHFlag: () => flagState.current,
}))

vi.mock('@/lib/profile', () => ({
  useProfile: () => ({ profile: profileState.current }),
}))

vi.mock('@/lib/telemetry/track', () => ({
  useTrack: () => mockTrack,
}))

describe('useOnboardingSurveyPrompt', () => {
  beforeEach(() => {
    flagState.current = 'org_form_collapsible'
    localStorageState.current = null
    organizationState.current = { slug: 'test-org' }
    profileState.current = { gotrue_id: 'user-1', id: 1 }
    projectState.current = { ref: 'project-ref' }
    mockMutateAsync.mockResolvedValue(undefined)
    mockTrackExperimentExposure.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not show the prompt for the control variant on any surface', () => {
    flagState.current = 'control'
    const { result } = renderHook(() => useOnboardingSurveyPrompt({ surface: 'org_form' }))

    expect(result.current.shouldShowPrompt).toBe(false)
    expect(result.current.variant).toBe('control')
  })

  it('shows the prompt when the variant matches the surface', () => {
    flagState.current = 'org_form_collapsible'
    const { result } = renderHook(() => useOnboardingSurveyPrompt({ surface: 'org_form' }))

    expect(result.current.shouldShowPrompt).toBe(true)
    expect(mockTrack).toHaveBeenCalledWith('onboarding_survey_prompt_shown', {
      surface: 'org_form',
      orgSlug: 'test-org',
      projectRef: 'project-ref',
    })
  })

  it('does not show the prompt when the variant does not match the surface', () => {
    flagState.current = 'org_form_collapsible'
    const { result } = renderHook(() => useOnboardingSurveyPrompt({ surface: 'project_home' }))

    expect(result.current.shouldShowPrompt).toBe(false)
  })

  it('shows the prompt for project_home surface with toast and dialog variants', () => {
    flagState.current = 'toast'
    const toastResult = renderHook(() =>
      useOnboardingSurveyPrompt({ surface: 'project_home' })
    ).result
    expect(toastResult.current.shouldShowPrompt).toBe(true)

    flagState.current = 'dialog'
    const dialogResult = renderHook(() =>
      useOnboardingSurveyPrompt({ surface: 'project_home' })
    ).result
    expect(dialogResult.current.shouldShowPrompt).toBe(true)
  })

  it('fires experiment exposure with the variant on mount', async () => {
    flagState.current = 'org_form_inline'
    renderHook(() => useOnboardingSurveyPrompt({ surface: 'org_form' }))

    await waitFor(() =>
      expect(mockTrackExperimentExposure).toHaveBeenCalledWith(
        'onboardingSurveyPlacement',
        'org_form_inline'
      )
    )
  })

  it('does not fire experiment exposure when the flag is still loading', () => {
    flagState.current = undefined
    renderHook(() => useOnboardingSurveyPrompt({ surface: 'org_form' }))

    expect(mockTrackExperimentExposure).toHaveBeenCalledWith('onboardingSurveyPlacement', undefined)
  })

  it('does not show after the user has dismissed or submitted', () => {
    flagState.current = 'org_form_collapsible'
    localStorageState.current = {
      status: 'submitted',
      updatedAt: '2026-05-07T00:00:00.000Z',
    }

    const { result } = renderHook(() => useOnboardingSurveyPrompt({ surface: 'org_form' }))

    expect(result.current.shouldShowPrompt).toBe(false)
  })

  it('tracks dialog opens and dismissals', () => {
    flagState.current = 'toast'
    const { result } = renderHook(() => useOnboardingSurveyPrompt({ surface: 'project_home' }))

    act(() => result.current.openDialog())
    expect(result.current.open).toBe(true)
    expect(mockTrack).toHaveBeenCalledWith('onboarding_survey_dialog_opened', {
      surface: 'project_home',
      orgSlug: 'test-org',
      projectRef: 'project-ref',
    })

    act(() => result.current.dismissPrompt('skip_button'))
    expect(mockSetLocalStorageState).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'dismissed' })
    )
    expect(mockTrack).toHaveBeenCalledWith('onboarding_survey_skipped', {
      surface: 'project_home',
      orgSlug: 'test-org',
      projectRef: 'project-ref',
      reason: 'skip_button',
    })
  })

  it('submits the survey payload and records completion', async () => {
    flagState.current = 'dialog'
    const { result } = renderHook(() => useOnboardingSurveyPrompt({ surface: 'project_home' }))

    await act(async () => {
      await result.current.submitSurvey({
        heard_from: 'ai_tool',
        building: 'SaaS app',
      })
    })

    expect(mockMutateAsync).toHaveBeenCalledWith({
      slug: 'test-org',
      heard_from: 'ai_tool',
      building: 'SaaS app',
    })
    expect(mockSetLocalStorageState).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'submitted' })
    )
    expect(mockTrack).toHaveBeenCalledWith('onboarding_survey_submitted', {
      surface: 'project_home',
      orgSlug: 'test-org',
      projectRef: 'project-ref',
      hasHeardFrom: true,
      hasBuilding: true,
    })
  })
})
