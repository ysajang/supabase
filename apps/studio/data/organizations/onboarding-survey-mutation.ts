import { useMutation } from '@tanstack/react-query'
import type { components } from 'api-types'

import type { ResponseError, UseCustomMutationOptions } from '@/types'

export type OnboardingSurveyBody = components['schemas']['OnboardingSurveyBody']

export type OnboardingSurveyVariables = {
  slug: string
  heard_from?: string
  building?: string
}

export function buildOnboardingSurveyPayload({
  slug,
  heard_from,
  building,
}: OnboardingSurveyVariables): OnboardingSurveyBody {
  const heardFrom = heard_from?.trim()
  const buildingValue = building?.trim()

  return {
    slug,
    ...(heardFrom ? { heard_from: heardFrom } : {}),
    ...(buildingValue ? { building: buildingValue } : {}),
  }
}

export async function submitOnboardingSurveyMock(variables: OnboardingSurveyVariables) {
  const payload = buildOnboardingSurveyPayload(variables)

  if (!payload.slug) {
    throw new Error('Organization slug is required')
  }

  await new Promise((resolve) => setTimeout(resolve, 300))
}

type SubmitOnboardingSurveyData = Awaited<ReturnType<typeof submitOnboardingSurveyMock>>

export const useOnboardingSurveyMutation = ({
  ...options
}: Omit<
  UseCustomMutationOptions<SubmitOnboardingSurveyData, ResponseError, OnboardingSurveyVariables>,
  'mutationFn'
> = {}) => {
  return useMutation<SubmitOnboardingSurveyData, ResponseError, OnboardingSurveyVariables>({
    mutationFn: (vars) => submitOnboardingSurveyMock(vars),
    ...options,
  })
}
