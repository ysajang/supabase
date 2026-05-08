import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { BUILDING_MAX_LENGTH } from './OnboardingSurvey.constants'
import { OnboardingSurveyDialog } from './OnboardingSurveyDialog'

vi.mock('ui', () => ({
  Button: ({ children, loading, ...props }: any) => (
    <button {...props} disabled={props.disabled || loading}>
      {children}
    </button>
  ),
  Dialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: ReactNode }) => <div role="dialog">{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogSection: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogSectionSeparator: () => <hr />,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  Label_Shadcn_: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  Select_Shadcn_: ({ children, onValueChange }: any) => (
    <div>
      {children}
      <button type="button" onClick={() => onValueChange('ai_tool')}>
        AI tool
      </button>
    </div>
  ),
  SelectContent_Shadcn_: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem_Shadcn_: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger_Shadcn_: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue_Shadcn_: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  Textarea: (props: any) => <textarea {...props} />,
}))

describe('OnboardingSurveyDialog', () => {
  it('submits optional answers', async () => {
    const onSubmit = vi.fn()

    render(
      <OnboardingSurveyDialog
        open
        onDismiss={vi.fn()}
        onOpenChange={vi.fn()}
        onSkip={vi.fn()}
        onSubmit={onSubmit}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'AI tool' }))
    await userEvent.type(screen.getByLabelText('What are you building?'), 'A SaaS app')
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onSubmit).toHaveBeenCalledWith({
      heard_from: 'ai_tool',
      building: 'A SaaS app',
    })
  })

  it('limits building input to 500 characters', async () => {
    render(
      <OnboardingSurveyDialog
        open
        onDismiss={vi.fn()}
        onOpenChange={vi.fn()}
        onSkip={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    const input = screen.getByLabelText('What are you building?')
    expect(input).toHaveAttribute('maxLength', String(BUILDING_MAX_LENGTH))
  })

  it('allows the user to skip', async () => {
    const onSkip = vi.fn()

    render(
      <OnboardingSurveyDialog
        open
        onDismiss={vi.fn()}
        onOpenChange={vi.fn()}
        onSkip={onSkip}
        onSubmit={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Skip' }))
    expect(onSkip).toHaveBeenCalled()
  })
})
