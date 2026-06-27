import { useQueryStates } from "nuqs";
import { executionsParams } from "@/features/executions/params";

export const useExecutionsParams = () => {
  return useQueryStates(executionsParams);
};
