"use client"

import { useSuspenseWorkflows } from "@/features/workflows/hooks/use-workflows";

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return (
    <div className="flex flex-1 justify-center items-center">
      <p>
        {JSON.stringify(workflows.data, null, 2)}
      </p>
    </div>
);
};
