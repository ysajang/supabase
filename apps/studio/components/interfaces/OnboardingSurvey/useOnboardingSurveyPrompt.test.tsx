import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useOnboardingSurveyPrompt } from './useOnboardingSurveyPrompt'
import { routerMock } from '@/tests/lib/route-mock'

type PromptState = { status: 'submitted' | 'dismissed'; updatedAt: string } | null
type OrganizationState = { slug: string } | undefined
type ProfileState = { gotrue_id?: string; id?: number } | undefined
type ProjectState = { ref: string } | undefined

const {
  localStorageState,
  mockMutateAsync,
  mockSetLocalStorageState,
  mockTrack,
  organizationState,
  profileState,
  projectState,
} = vi.hoisted(() => ({
  localStorageState: { current: null as PromptState },
  mockMutateAsync: vi.fn(),
  mockSetLocalStorageState: vi.fn((value: PromptState | ((state: PromptState) => PromptState)) => {
    localStorageState.current = value instanceof Function ? value(localStorageState.current) : value
  }),
  mockTrack: vi.fn(),
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

vi.mock('@/lib/profile', () => ({
  useProfile: () => ({ profile: profileState.current }),
}))

vi.mock('@/lib/telemetry/track', () => ({
  useTrack: () => mockTrack,
}))

describe('useOnboardingSurveyPrompt', () => {
  beforeEach(() => {
    localStorageState.current = null
    organizationState.current = { slug: 'test-org' }
    profileState.current = { gotrue_id: 'user-1', id: 1 }
    projectState.current = { ref: 'project-ref' }
    mockMutateAsync.mockResolvedValue(undefined)
    routerMock.setCurrentUrl('/project/project-ref')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows the prompt once a project, organization, and profile are available', () => {
    const { result } = renderHook(() => useOnboardingSurveyPrompt({ surface: 'building_state' }))

    expect(result.current.shouldShowPrompt).toBe(true)
    expect(mockTrack).toHaveBeenCalledWith('onboarding_survey_prompt_shown', {
      surface: 'building_state',
      orgSlug: 'test-org',
      projectRef: 'project-ref',
    })
  })

  it('does not show after the user has dismissed or submitted it', () => {
    localStorageState.current = { status: 'dismissed', updatedAt: '2026-05-07T00:00:00.000Z' }

    const { result } = renderHook(() => useOnboardingSurveyPrompt({ surface: 'project_home' }))

    expect(result.current.shouldShowPrompt).toBe(false)
  })

  it.each(['building_state', 'building_state_inline'])(
    'can be forced for prototype testing with %s',
    (override) => {
      localStorageState.current = { status: 'dismissed', updatedAt: '2026-05-07T00:00:00.000Z' }
      routerMock.setCurrentUrl(`/project/project-ref?onboardingSurveyPrompt=${override}`)

      const { result } = renderHook(() => useOnboardingSurveyPrompt({ surface: 'building_state' }))

      expect(result.current.shouldShowPrompt).toBe(true)
    }
  )

  it('can be forced for prototype testing on the project home surface', () => {
    localStorageState.current = { status: 'dismissed', updatedAt: '2026-05-07T00:00:00.000Z' }
    routerMock.setCurrentUrl('/project/project-ref?onboardingSurveyPrompt=project_home')

    const { result } = renderHook(() => useOnboardingSurveyPrompt({ surface: 'project_home' }))

    expect(result.current.shouldShowPrompt).toBe(true)
  })

  it('tracks dialog opens and dismissals', () => {
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

  it('submits the mock payload and records completion state', async () => {
    const { result } = renderHook(() => useOnboardingSurveyPrompt({ surface: 'building_state' }))

    await act(async () => {
      await result.current.submitSurvey({ heard_from: 'ai_tool', building: 'SaaS app' })
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
      surface: 'building_state',
      orgSlug: 'test-org',
      projectRef: 'project-ref',
      hasHeardFrom: true,
      hasBuilding: true,
    })
  })
})
