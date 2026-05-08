import { Button, cn } from 'ui'

import { OnboardingSurveyDialog } from './OnboardingSurveyDialog'
import { useOnboardingSurveyPrompt } from './useOnboardingSurveyPrompt'

type OnboardingSurveyInlinePromptProps = {
  className?: string
}

export function OnboardingSurveyInlinePrompt({ className }: OnboardingSurveyInlinePromptProps) {
  const prompt = useOnboardingSurveyPrompt({ surface: 'building_state' })

  if (!prompt.shouldShowPrompt) return null

  return (
    <>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center gap-y-4 overflow-hidden rounded-md border border-muted bg-surface-200/50 p-6',
          className
        )}
      >
        <div className="absolute inset-0 bg-grid-black/5 mask-[linear-gradient(0deg,#fff,rgba(255,255,255,0.35))] dark:bg-grid-white/5 dark:mask-[linear-gradient(0deg,rgba(255,255,255,0.08),rgba(255,255,255,0.4))]" />
        <div className="relative max-w-lg space-y-1 text-center">
          <h4 className="text-base text-foreground">Whilst you wait</h4>
          <p className="text-sm text-foreground-light text-balance">
            Share what brought you here and what you are building so we can tailor your experience.
          </p>
        </div>
        <Button type="default" size="tiny" className="relative w-fit" onClick={prompt.openDialog}>
          Answer questions
        </Button>
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
