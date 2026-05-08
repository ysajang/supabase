import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from 'ui'

import { OnboardingSurveyDialog } from './OnboardingSurveyDialog'
import { useOnboardingSurveyPrompt } from './useOnboardingSurveyPrompt'

type OnboardingSurveyToastPromptProps = {
  autoOpen?: boolean
}

const WELCOME_TITLE = 'Welcome to Supabase'

const WELCOME_DESCRIPTION =
  'Your project is spinning up. While you wait, answer two optional questions so we can better serve you.'

export function OnboardingSurveyToastPrompt({
  autoOpen = false,
}: OnboardingSurveyToastPromptProps) {
  const prompt = useOnboardingSurveyPrompt({ surface: 'project_home' })
  const toastId = useRef<string | number>()
  const { dismissPrompt, openDialog, shouldShowPrompt } = prompt

  useEffect(() => {
    if (!autoOpen || !shouldShowPrompt) return

    openDialog()
  }, [autoOpen, openDialog, shouldShowPrompt])

  useEffect(() => {
    if (autoOpen || !shouldShowPrompt || toastId.current !== undefined) return

    toastId.current = toast.custom(
      (id) => (
        <div className="w-[320px] rounded-md border border-overlay-border bg-surface-100 p-4 shadow-lg">
          <div className="space-y-1">
            <p className="text-sm text-foreground">Help us tailor your setup</p>
            <p className="text-sm text-foreground-light">
              Answer two optional questions about how you found Supabase and what you are building.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button
              type="primary"
              size="tiny"
              onClick={() => {
                toast.dismiss(id)
                toastId.current = undefined
                openDialog()
              }}
            >
              Answer
            </Button>
            <Button
              type="default"
              size="tiny"
              onClick={() => {
                toast.dismiss(id)
                toastId.current = undefined
                dismissPrompt('toast_skip')
              }}
            >
              Skip
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity }
    )

    return () => {
      if (toastId.current !== undefined) {
        toast.dismiss(toastId.current)
        toastId.current = undefined
      }
    }
  }, [autoOpen, dismissPrompt, openDialog, shouldShowPrompt])

  return (
    <OnboardingSurveyDialog
      open={prompt.open}
      title={autoOpen ? WELCOME_TITLE : undefined}
      description={autoOpen ? WELCOME_DESCRIPTION : undefined}
      isSubmitting={prompt.isSubmitting}
      onDismiss={() => prompt.dismissPrompt('dialog_dismissed')}
      onOpenChange={prompt.setOpen}
      onSkip={() => prompt.dismissPrompt('skip_button')}
      onSubmit={prompt.submitSurvey}
    />
  )
}
