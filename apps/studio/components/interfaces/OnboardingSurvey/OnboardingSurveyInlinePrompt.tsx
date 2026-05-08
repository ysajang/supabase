import { Button } from 'ui'

import { OnboardingSurveyDialog } from './OnboardingSurveyDialog'
import { useOnboardingSurveyPrompt } from './useOnboardingSurveyPrompt'

export function OnboardingSurveyInlinePrompt() {
  const prompt = useOnboardingSurveyPrompt({ surface: 'building_state' })

  if (!prompt.shouldShowPrompt) return null

  return (
    <>
      <div className="rounded-md border border-border bg-surface-100 p-4">
        <div className="space-y-1">
          <h4 className="text-sm text-foreground">Help us tailor your setup</h4>
          <p className="text-sm text-foreground-light">
            Answer two optional questions while your project is being prepared.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="primary" size="tiny" onClick={prompt.openDialog}>
            Answer questions
          </Button>
          <Button type="default" size="tiny" onClick={() => prompt.dismissPrompt('skip_button')}>
            Skip
          </Button>
        </div>
      </div>
      <OnboardingSurveyDialog
        open={prompt.open}
        isSubmitting={prompt.isSubmitting}
        onDismiss={() => prompt.dismissPrompt('dialog_dismissed')}
        onOpenChange={prompt.setOpen}
        onSkip={() => prompt.dismissPrompt('skip_button')}
        onSubmit={prompt.submitSurvey}
      />
    </>
  )
}
