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
          forceMount
          className={cn(
            'grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out',
            'data-closed:grid-rows-[0fr] data-closed:opacity-0',
            'data-open:grid-rows-[1fr] data-open:opacity-100'
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="pt-2">
              {description && (
                <p className="text-xs text-foreground-lighter mb-6">{description}</p>
              )}
              {children}
            </div>
          </div>
        </CollapsibleContent_Shadcn_>
      </Collapsible_Shadcn_>
    </Panel.Content>
  )
}
