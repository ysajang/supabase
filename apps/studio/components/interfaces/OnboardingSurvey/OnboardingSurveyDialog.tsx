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
  ORG_KIND_TYPES,
  ORG_SIZE_DEFAULT,
  ORG_SIZE_TYPES,
} from './OnboardingSurvey.constants'

type OnboardingSurveyDialogProps = {
  open: boolean
  description?: string
  isSubmitting?: boolean
  onDismiss: () => void
  onOpenChange: (open: boolean) => void
  onSkip: () => void
  onSubmit: (values: { heard_from?: string; building?: string }) => Promise<unknown> | unknown
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
    await onSubmit({
      heard_from: formatHeardFromAnswer(heardFrom, heardFromDetail),
      building,
    })
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
                <Label_Shadcn_ htmlFor="onboarding-survey-org-kind">Type</Label_Shadcn_>
                <Select_Shadcn_
                  value={orgKind}
                  onValueChange={(value) => setOrgKind(value as keyof typeof ORG_KIND_TYPES)}
                >
                  <SelectTrigger_Shadcn_ id="onboarding-survey-org-kind" className="w-full">
                    <SelectValue_Shadcn_ />
                  </SelectTrigger_Shadcn_>
                  <SelectContent_Shadcn_>
                    {Object.entries(ORG_KIND_TYPES).map(([value, label]) => (
                      <SelectItem_Shadcn_ key={value} value={value}>
                        {label}
                      </SelectItem_Shadcn_>
                    ))}
                  </SelectContent_Shadcn_>
                </Select_Shadcn_>
                <p className="text-xs text-foreground-lighter">
                  What best describes your organization?
                </p>
              </div>

              {orgKind === 'COMPANY' && (
                <div className="flex flex-col gap-y-2">
                  <Label_Shadcn_ htmlFor="onboarding-survey-org-size">Company size</Label_Shadcn_>
                  <Select_Shadcn_
                    value={orgSize}
                    onValueChange={(value) => setOrgSize(value as keyof typeof ORG_SIZE_TYPES)}
                  >
                    <SelectTrigger_Shadcn_ id="onboarding-survey-org-size" className="w-full">
                      <SelectValue_Shadcn_ />
                    </SelectTrigger_Shadcn_>
                    <SelectContent_Shadcn_>
                      {Object.entries(ORG_SIZE_TYPES).map(([value, label]) => (
                        <SelectItem_Shadcn_ key={value} value={value}>
                          {label}
                        </SelectItem_Shadcn_>
                      ))}
                    </SelectContent_Shadcn_>
                  </Select_Shadcn_>
                  <p className="text-xs text-foreground-lighter">
                    How many people are in your company?
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex flex-col gap-y-2">
            <Label_Shadcn_ htmlFor="onboarding-survey-heard-from">
              Where did you hear about us?
            </Label_Shadcn_>
            <Select_Shadcn_
              value={heardFrom}
              onValueChange={(value) => {
                setHeardFrom(value)
                if (!HEARD_FROM_FOLLOW_UP_BY_VALUE[value]) setHeardFromDetail('')
              }}
            >
              <SelectTrigger_Shadcn_ id="onboarding-survey-heard-from" className="w-full">
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
              <Label_Shadcn_ htmlFor="onboarding-survey-building">
                What are you building?
              </Label_Shadcn_>
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
