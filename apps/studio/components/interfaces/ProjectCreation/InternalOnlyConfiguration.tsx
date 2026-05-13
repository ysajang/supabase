import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, Input_Shadcn_ } from 'ui'
import { FormItemLayout } from 'ui-patterns/form/FormItemLayout/FormItemLayout'

import { CreateProjectForm } from './ProjectCreation.schema'
import { ProjectCreationCollapsibleSection } from './ProjectCreationCollapsibleSection'

interface InternalOnlyConfigurationProps {
  form: UseFormReturn<CreateProjectForm>
}

export const InternalOnlyConfiguration = ({ form }: InternalOnlyConfigurationProps) => {
  return (
    <ProjectCreationCollapsibleSection
      title="Internal-only Configuration"
      description="These settings are only applicable for local/staging projects"
    >
      <div className="flex flex-col gap-y-4">
        <FormField
          control={form.control}
          name="postgresVersion"
          render={({ field }) => (
            <FormItemLayout
              label="Custom Postgres version"
              layout="horizontal"
              description="Specify a custom version of Postgres (defaults to the latest)."
            >
              <FormControl>
                <Input_Shadcn_ placeholder="e.g 17.6.1.104" {...field} autoComplete="off" />
              </FormControl>
            </FormItemLayout>
          )}
        />

        <FormField
          control={form.control}
          name="instanceType"
          render={({ field }) => (
            <FormItemLayout
              label="Custom instance type"
              layout="horizontal"
              description="Specify a custom instance type."
            >
              <FormControl>
                <Input_Shadcn_ placeholder="e.g t3.nano" {...field} autoComplete="off" />
              </FormControl>
            </FormItemLayout>
          )}
        />
      </div>
    </ProjectCreationCollapsibleSection>
  )
}
