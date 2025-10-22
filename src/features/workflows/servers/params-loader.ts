import { createLoader } from "nuqs/server";
import { workflowParams } from "@/features/workflows/params";

export const workflowsParamsLoader = createLoader(workflowParams);