import { useQueryStates } from "nuqs";

import { workflowParams } from "@/features/workflows/params";

export const useWorkflowsParams = () => {
    return useQueryStates(workflowParams);
};