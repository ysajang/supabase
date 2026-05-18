import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogSection,
  DialogSectionSeparator,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from 'ui'

import {
  BUILDING_MAX_LENGTH,
  BUILDING_PLACEHOLDER,
  buildOnboardingSurveyAnswers,
  formatHeardFromAnswer,
  HEARD_FROM_FOLLOW_UP_BY_VALUE,
  HEARD_FROM_OPTIONS,
  ORG_KIND_TYPES,
  ORG_SIZE_DEFAULT,
  ORG_SIZE_TYPES,
  type OnboardingSurveyAnswers,
} from './OnboardingSurvey.constants'

type OnboardingSurveyDialogProps = {
  open: boolean
  description?: string
  isSubmitting?: boolean
  onDismiss: () => void
  onOpenChange: (open: boolean) => void
  onSkip: () => void
  onSubmit: (values: OnboardingSurveyAnswers) => Promise<unknown> | unknown
  showOrgFields?: boolean
  title?: string
}

export function OnboardingSurveyDialog({
  open,
  description = 'Answer two optional questions so we can improve your Supabase experience.',
  isSubmitting = false,
  onDismiss,
  onOpenChange,
  onSkip,
  onSubmit,
  showOrgFields = false,
  title = 'Help us tailor your setup',
}: OnboardingSurveyDialogProps) {
  const [orgKind, setOrgKind] = useState<keyof typeof ORG_KIND_TYPES>('COMPANY')
  const [orgSize, setOrgSize] = useState<keyof typeof ORG_SIZE_TYPES>(ORG_SIZE_DEFAULT)
  const [heardFrom, setHeardFrom] = useState('')
  const [heardFromDetail, setHeardFromDetail] = useState('')
  const [building, setBuilding] = useState('')
  const heardFromFollowUp = HEARD_FROM_FOLLOW_UP_BY_VALUE[heardFrom]
  const dialogDescription =
    showOrgFields &&
    description === 'Answer two optional questions so we can improve your Supabase experience.'
      ? 'Answer a few optional questions so we can improve your Supabase experience.'
      : description

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && open && !isSubmitting) {
      onDismiss()
      return
    }

    onOpenChange(nextOpen)
  }

  const handleSubmit = async () => {
    await onSubmit(
      buildOnboardingSurveyAnswers({
        heardFrom: formatHeardFromAnswer(heardFrom, heardFromDetail),
        building,
        showOrgFields,
        orgKind,
        orgSize,
      })
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="small" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogSectionSeparator />
        <DialogSection className="flex flex-col gap-y-6 pt-4.5 pb-5">
          <p className="text-sm text-foreground-light">{dialogDescription}</p>

          {showOrgFields && (
            <>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="onboarding-survey-org-kind">Type</Label>
                <Select
                  value={orgKind}
                  onValueChange={(value) => setOrgKind(value as keyof typeof ORG_KIND_TYPES)}
                >
                  <SelectTrigger id="onboarding-survey-org-kind" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORG_KIND_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-foreground-lighter">
                  What best describes your organization?
                </p>
              </div>

              {orgKind === 'COMPANY' && (
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="onboarding-survey-org-size">Company size</Label>
                  <Select
                    value={orgSize}
                    onValueChange={(value) => setOrgSize(value as keyof typeof ORG_SIZE_TYPES)}
                  >
                    <SelectTrigger id="onboarding-survey-org-size" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ORG_SIZE_TYPES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-foreground-lighter">
                    How many people are in your company?
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex flex-col gap-y-2">
            <Label htmlFor="onboarding-survey-heard-from">
              Where did you hear about us?
            </Label>
            <Select
              value={heardFrom}
              onValueChange={(value) => {
                setHeardFrom(value)
                if (!HEARD_FROM_FOLLOW_UP_BY_VALUE[value]) setHeardFromDetail('')
              }}
            >
              <SelectTrigger id="onboarding-survey-heard-from" className="w-full">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {HEARD_FROM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {heardFromFollowUp && (
              <Input
                aria-label={heardFromFollowUp.label}
                value={heardFromDetail}
                placeholder={heardFromFollowUp.placeholder}
                onChange={(event) => setHeardFromDetail(event.target.value)}
              />
            )}
          </div>

          <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="onboarding-survey-building">
                What are you building?
              </Label>
              <span className="text-xs text-foreground-lighter">
                {building.length}/{BUILDING_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              id="onboarding-survey-building"
              value={building}
              rows={3}
              maxLength={BUILDING_MAX_LENGTH}
              placeholder={BUILDING_PLACEHOLDER}
              className="resize-none"
              onChange={(event) => setBuilding(event.target.value)}
            />
          </div>
        </DialogSection>

        <DialogFooter className="px-5 py-4">
          <Button type="default" disabled={isSubmitting} onClick={onSkip}>
            Skip
          </Button>
          <Button loading={isSubmitting} onClick={handleSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
