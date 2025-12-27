"use client"

import { EntityList } from "@/components/entity-components/entity-list";

import { useSuspenseWorkflows } from "@/features/workflows/hooks/use-workflows";
import { WorkflowItem } from "@/features/workflows/components/workflows/workflow-item";
import { WorkflowsEmpty } from "@/features/workflows/components/workflows/workflows-empty";

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return (
    <EntityList 
      items={workflows.data.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItem data={workflow} />}
      emptyView={<WorkflowsEmpty />}
    />
  )
};

