import { describe, expect, it } from 'vitest'

import { buildOnboardingSurveyPayload } from './onboarding-survey-mutation'

describe('buildOnboardingSurveyPayload', () => {
  it('matches the onboarding survey API body shape', () => {
    expect(
      buildOnboardingSurveyPayload({
        slug: 'test-org',
        heard_from: ' ai_tool ',
        building: ' a mobile game backend ',
      })
    ).toEqual({
      slug: 'test-org',
      heard_from: 'ai_tool',
      building: 'a mobile game backend',
    })
  })

  it('omits empty optional values', () => {
    expect(
      buildOnboardingSurveyPayload({
        slug: 'test-org',
        heard_from: ' ',
        building: '',
      })
    ).toEqual({ slug: 'test-org' })
  })
})
