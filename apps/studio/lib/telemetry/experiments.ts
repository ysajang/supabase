/**
 * Registry of active PostHog experiments. The key is the PostHog flag key
 * (passed to `usePHFlag` and configured on PostHog). The value is the
 * exposure event name base, which becomes
 * `${value}_experiment_exposed` when emitted via `useTrackExperimentExposure`.
 *
 * Convention for new experiments: snake_case the exposure name so the
 * emitted event matches the rest of the telemetry catalog. Existing
 * camelCase exposure names (e.g. `headerUpgradeCta`) are kept to avoid
 * breaking saved PostHog insights and experiment dashboards.
 *
 * Adding a new experiment: register the flag key here, then pass it to
 * `useTrackExperimentExposure`. TypeScript will reject any unregistered key.
 */
export const EXPERIMENTS = {
  headerUpgradeCta: 'headerUpgradeCta',
  onboardingSurveyPlacement: 'onboarding_survey_placement',
} as const

export type ExperimentKey = keyof typeof EXPERIMENTS
