export const HEARD_FROM_OPTIONS = [
  { value: 'search_engine', label: 'Search engine' },
  { value: 'social_media', label: 'Social media' },
  { value: 'ai_tool', label: 'AI tool' },
  { value: 'friend_colleague', label: 'Friend or colleague' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'blog_article', label: 'Blog or article' },
  { value: 'conference', label: 'Conference' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'other', label: 'Other' },
] as const

export type HeardFromOptionValue = (typeof HEARD_FROM_OPTIONS)[number]['value']

export const HEARD_FROM_OTHER_VALUE = 'other'

export const HEARD_FROM_FOLLOW_UP_BY_VALUE: Record<
  string,
  { label: string; placeholder: string } | undefined
> = {
  social_media: {
    label: 'Which platform?',
    placeholder: 'e.g. X, Reddit, LinkedIn',
  },
  ai_tool: {
    label: 'Which AI tool?',
    placeholder: 'e.g. ChatGPT, Claude, Cursor',
  },
  youtube: {
    label: 'Which channel or video?',
    placeholder: 'e.g. Supabase, Fireship, KRAZAM',
  },
  blog_article: {
    label: 'Which blog or article?',
    placeholder: 'Paste a title, site, or link',
  },
  conference: {
    label: 'Which conference?',
    placeholder: 'e.g. Launch Week, PostgresConf, local meetup',
  },
  podcast: {
    label: 'Which podcast?',
    placeholder: 'e.g. Syntax, Changelog, Software Engineering Daily',
  },
  other: {
    label: 'Tell us where',
    placeholder: 'Tell us where',
  },
}

export function formatHeardFromAnswer(value?: string, detail?: string) {
  const trimmedValue = value?.trim()
  const trimmedDetail = detail?.trim()

  if (!trimmedValue) return trimmedDetail
  if (!trimmedDetail) return trimmedValue
  if (trimmedValue === HEARD_FROM_OTHER_VALUE) return trimmedDetail

  return `${trimmedValue}: ${trimmedDetail}`
}

export const BUILDING_MAX_LENGTH = 500

export const BUILDING_PLACEHOLDER =
  'e.g. realtime collaboration, an AI support workflow, or an operations dashboard'

export type OnboardingSurveySurface = 'building_state' | 'project_home' | 'org_form'

export const ONBOARDING_SURVEY_PROMPT_QUERY_PARAM = 'onboardingSurveyPrompt'

export function getOnboardingSurveyPromptOverride(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

export function shouldForceOnboardingSurveyPrompt({
  override,
  surface,
}: {
  override?: string
  surface: OnboardingSurveySurface
}) {
  return (
    override === '1' ||
    override === 'true' ||
    override === surface ||
    (surface === 'project_home' && (override === 'dialog' || override === 'toast'))
  )
}

export type OnboardingSurveyPromptStatus = 'submitted' | 'dismissed'

export type OnboardingSurveyPromptState = {
  status: OnboardingSurveyPromptStatus
  updatedAt: string
}
