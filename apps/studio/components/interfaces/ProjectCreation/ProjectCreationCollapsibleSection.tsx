import { ChevronRight } from 'lucide-react'
import { PropsWithChildren, ReactNode } from 'react'
import { cn, Collapsible_Shadcn_, CollapsibleContent_Shadcn_, CollapsibleTrigger_Shadcn_ } from 'ui'

import Panel from '@/components/ui/Panel'

type ProjectCreationCollapsibleSectionProps = PropsWithChildren<{
  description?: ReactNode
  title: string
}>

export const ProjectCreationCollapsibleSection = ({
  children,
  description,
  title,
}: ProjectCreationCollapsibleSectionProps) => {
  return (
    <Panel.Content>
      <Collapsible_Shadcn_>
        <CollapsibleTrigger_Shadcn_ className="group/advanced-trigger font-mono uppercase tracking-widest text-xs flex items-center gap-1 text-foreground-lighter/75 hover:text-foreground-light transition data-open:text-foreground-light">
          {title}
          <ChevronRight
            size={16}
            strokeWidth={1}
            className="mr-2 group-data-open/advanced-trigger:rotate-90 group-hover/advanced-trigger:text-foreground-light transition"
          />
        </CollapsibleTrigger_Shadcn_>
        <CollapsibleContent_Shadcn_
          className={cn(
            'pt-2 data-closed:animate-collapsible-up data-open:animate-collapsible-down'
          )}
        >
          {description && <p className="text-xs text-foreground-lighter mb-6">{description}</p>}
          {children}
        </CollapsibleContent_Shadcn_>
      </Collapsible_Shadcn_>
    </Panel.Content>
  )
}
