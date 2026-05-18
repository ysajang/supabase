import { hasConsented, posthogClient } from 'common'
import { useEffect } from 'react'

import { EXPERIMENTS, type ExperimentKey } from '@/lib/telemetry/experiments'

/**
 * Captures a PostHog experiment exposure. Looks up the exposure event name
 * from the EXPERIMENTS registry and emits `${exposureName}_experiment_exposed`.
 * Register new experiments in `apps/studio/lib/telemetry/experiments.ts`
 * before calling this hook.
 */
export function useTrackExperimentExposure(
  experimentKey: ExperimentKey,
  variant: string | undefined,
  extraProperties?: Record<string, any>
) {
  useEffect(() => {
    if (!variant) return

    posthogClient.captureExperimentExposure(
      EXPERIMENTS[experimentKey],
      { variant, ...extraProperties },
      hasConsented()
    )
  }, [experimentKey, variant])
}
