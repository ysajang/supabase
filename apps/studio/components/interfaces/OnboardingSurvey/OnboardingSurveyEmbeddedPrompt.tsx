import { CheckCircle, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
import { useOnboardingSurveyPrompt } from './useOnboardingSurveyPrompt'

const CONTENT_TRANSITION_MS = 160

type OnboardingSurveyEmbeddedPromptProps = {
  className?: string
  onClose?: () => void
}

export function OnboardingSurveyEmbeddedPrompt({
  className,
  onClose,
}: OnboardingSurveyEmbeddedPromptProps) {
  const prompt = useOnboardingSurveyPrompt({ surface: 'building_state' })
  const [heardFrom, setHeardFrom] = useState('')
  const [heardFromDetail, setHeardFromDetail] = useState('')
  const [building, setBuilding] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isContentVisible, setIsContentVisible] = useState(true)
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heardFromFollowUp = HEARD_FROM_FOLLOW_UP_BY_VALUE[heardFrom]

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
    }
  }, [])

  if (!prompt.shouldShowPrompt && !isSubmitted) return null

  const submitSurvey = async () => {
    const didSubmit = await prompt.submitSurvey(
      {
        heard_from: formatHeardFromAnswer(heardFrom, heardFromDetail),
        building,
      },
      { showSuccessToast: false }
    )

    if (!didSubmit) return

    setIsContentVisible(false)
    transitionTimeoutRef.current = setTimeout(() => {
      setIsSubmitted(true)
      requestAnimationFrame(() => setIsContentVisible(true))
    }, CONTENT_TRANSITION_MS)
  }

  const closePrompt = () => {
    prompt.dismissPrompt('close_button')
    onClose?.()
  }

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-md border border-muted bg-surface-200/20 p-12',
        className
      )}
    >
      <div className="absolute inset-0 bg-grid-black/5 mask-[linear-gradient(0deg,#fff,rgba(255,255,255,0.35))] dark:bg-grid-white/5 dark:mask-[linear-gradient(0deg,rgba(255,255,255,0.08),rgba(255,255,255,0.4))]" />
      <Button
        type="text"
        size="tiny"
        className="absolute right-3 top-3 z-10 px-1"
        icon={<X />}
        aria-label="Close onboarding questions"
        onClick={closePrompt}
      />

      <div
        className={cn(
          'relative mx-auto my-auto flex h-full w-full max-w-sm flex-col justify-center transition-opacity duration-200 ease-out',
          isContentVisible ? 'opacity-100' : 'opacity-0',
          isSubmitted ? 'items-center text-center' : 'gap-y-8'
        )}
      >
        {isSubmitted ? (
          <div className="flex flex-col items-center gap-y-3">
            <CheckCircle className="text-brand" size={28} strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="text-sm text-foreground">Thanks for sharing</p>
              <p className="text-sm text-foreground-light">
                We will use this to shape a better first-run experience.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1 pr-8 text-left">
              <h4 className="text-base text-foreground">Whilst you wait</h4>
              <p className="text-sm text-foreground-light text-balance">
                Share what brought you here so we can tailor your experience.
              </p>
            </div>

            <div className="flex w-full flex-col gap-y-4">
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
                  <SelectTrigger_Shadcn_
                    id="onboarding-survey-inline-heard-from"
                    className="w-full bg-surface-100"
                  >
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
                    className="bg-surface-100"
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
                  className="resize-none bg-surface-100"
                  onChange={(event) => setBuilding(event.target.value)}
                />
              </div>

              <Button
                type="default"
                size="tiny"
                loading={prompt.isSubmitting}
                className="self-end"
                onClick={submitSurvey}
              >
                Submit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
