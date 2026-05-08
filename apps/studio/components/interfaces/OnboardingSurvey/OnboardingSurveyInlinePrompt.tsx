import { useState } from 'react'
import {
  Button,
  cn,
  Input_Shadcn_,
  Label_Shadcn_,
  Select_Shadcn_,
  SelectContent_Shadcn_,
  SelectItem_Shadcn_,
  SelectTrigger_Shadcn_,
  SelectValue_Shadcn_,
  Textarea,
} from 'ui'

import {
  BUILDING_MAX_LENGTH,
  BUILDING_PLACEHOLDER,
  formatHeardFromAnswer,
  HEARD_FROM_FOLLOW_UP_BY_VALUE,
  HEARD_FROM_OPTIONS,
} from './OnboardingSurvey.constants'
import { OnboardingSurveyDialog } from './OnboardingSurveyDialog'
import { useOnboardingSurveyPrompt } from './useOnboardingSurveyPrompt'

type OnboardingSurveyInlinePromptProps = {
  className?: string
  variant?: 'dialog' | 'embedded'
}

export function OnboardingSurveyInlinePrompt({
  className,
  variant = 'dialog',
}: OnboardingSurveyInlinePromptProps) {
  const prompt = useOnboardingSurveyPrompt({ surface: 'building_state' })
  const [heardFrom, setHeardFrom] = useState('')
  const [heardFromDetail, setHeardFromDetail] = useState('')
  const [building, setBuilding] = useState('')
  const heardFromFollowUp = HEARD_FROM_FOLLOW_UP_BY_VALUE[heardFrom]
  const isEmbedded = variant === 'embedded'

  if (!prompt.shouldShowPrompt) return null

  const submitEmbeddedSurvey = async () => {
    await prompt.submitSurvey({
      heard_from: formatHeardFromAnswer(heardFrom, heardFromDetail),
      building,
    })
  }

  return (
    <>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center gap-y-4 overflow-hidden rounded-md border border-muted bg-surface-200 p-6',
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

        {isEmbedded ? (
          <div className="relative flex w-full max-w-md flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <Label_Shadcn_ htmlFor="onboarding-survey-inline-heard-from">
                Where did you hear about us?
              </Label_Shadcn_>
              <Select_Shadcn_
                value={heardFrom}
                onValueChange={(value) => {
                  setHeardFrom(value)
                  if (!HEARD_FROM_FOLLOW_UP_BY_VALUE[value]) setHeardFromDetail('')
                }}
              >
                <SelectTrigger_Shadcn_ id="onboarding-survey-inline-heard-from" className="w-full">
                  <SelectValue_Shadcn_ placeholder="Select an option" />
                </SelectTrigger_Shadcn_>
                <SelectContent_Shadcn_>
                  {HEARD_FROM_OPTIONS.map((option) => (
                    <SelectItem_Shadcn_ key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem_Shadcn_>
                  ))}
                </SelectContent_Shadcn_>
              </Select_Shadcn_>
              {heardFromFollowUp && (
                <Input_Shadcn_
                  aria-label={heardFromFollowUp.label}
                  value={heardFromDetail}
                  placeholder={heardFromFollowUp.placeholder}
                  onChange={(event) => setHeardFromDetail(event.target.value)}
                />
              )}
            </div>

            <div className="flex flex-col gap-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label_Shadcn_ htmlFor="onboarding-survey-inline-building">
                  What are you building?
                </Label_Shadcn_>
                <span className="text-xs text-foreground-lighter">
                  {building.length}/{BUILDING_MAX_LENGTH}
                </span>
              </div>
              <Textarea
                id="onboarding-survey-inline-building"
                value={building}
                rows={3}
                maxLength={BUILDING_MAX_LENGTH}
                placeholder={BUILDING_PLACEHOLDER}
                className="resize-none"
                onChange={(event) => setBuilding(event.target.value)}
              />
            </div>

            <Button
              type="default"
              size="tiny"
              loading={prompt.isSubmitting}
              className="self-center"
              onClick={submitEmbeddedSurvey}
            >
              Submit
            </Button>
          </div>
        ) : (
          <Button type="default" size="tiny" className="relative w-fit" onClick={prompt.openDialog}>
            Answer questions
          </Button>
        )}
      </div>
      {!isEmbedded && (
        <OnboardingSurveyDialog
          open={prompt.open}
          isSubmitting={prompt.isSubmitting}
          onDismiss={() => prompt.dismissPrompt('dialog_dismissed')}
          onOpenChange={prompt.setOpen}
          onSkip={() => prompt.dismissPrompt('skip_button')}
          onSubmit={prompt.submitSurvey}
        />
      )}
    </>
  )
}
