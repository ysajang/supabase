import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { OnboardingSurveyToastPrompt } from './OnboardingSurveyToastPrompt'

const { mockOpenDialog, promptState } = vi.hoisted(() => ({
  mockOpenDialog: vi.fn(),
  promptState: {
    current: {
      dismissPrompt: vi.fn(),
      isSubmitting: false,
      open: false,
      openDialog: vi.fn(),
      setOpen: vi.fn(),
      shouldShowPrompt: true,
      submitSurvey: vi.fn(),
    },
  },
}))

vi.mock('sonner', () => ({
  toast: {
    custom: vi.fn(),
    dismiss: vi.fn(),
  },
}))

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
  Select_Shadcn_: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectContent_Shadcn_: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem_Shadcn_: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger_Shadcn_: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue_Shadcn_: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  Textarea: (props: any) => <textarea {...props} />,
}))

vi.mock('./useOnboardingSurveyPrompt', () => ({
  useOnboardingSurveyPrompt: () => ({
    ...promptState.current,
    openDialog: mockOpenDialog,
  }),
}))

describe('OnboardingSurveyToastPrompt', () => {
  afterEach(() => {
    vi.clearAllMocks()
    promptState.current.open = false
    promptState.current.shouldShowPrompt = true
  })

  it('auto-opens the welcome dialog when requested', () => {
    render(<OnboardingSurveyToastPrompt autoOpen />)

    expect(mockOpenDialog).toHaveBeenCalledTimes(1)
  })

  it('uses welcome copy for the auto-open dialog', () => {
    promptState.current.open = true

    render(<OnboardingSurveyToastPrompt autoOpen />)

    expect(screen.getByText('Welcome to Supabase')).toBeTruthy()
    expect(
      screen.getByText(
        'Your project is spinning up. While you wait, answer two optional questions so we can better serve you.'
      )
    ).toBeTruthy()
  })
})
