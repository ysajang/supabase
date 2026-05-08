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

export const BUILDING_MAX_LENGTH = 500

export const BUILDING_PLACEHOLDER = 'e.g. an AI chatbot, a SaaS app, a mobile game backend'

export type OnboardingSurveySurface = 'building_state' | 'project_home' | 'org_form'

export type OnboardingSurveyPromptStatus = 'submitted' | 'dismissed'

export type OnboardingSurveyPromptState = {
  status: OnboardingSurveyPromptStatus
  updatedAt: string
}
