import { createLoader } from "nuqs/server";
import { executionsParams } from "@/features/executions/params";

export const executionsParamsLoader = createLoader(executionsParams);
