import { createTRPCRouter } from "@/trpc/init";

import { executionsRouter } from "@/features/executions/server/routers";
import { workflowsRouter } from "@/features/workflows/servers/routers";
import { credentialsRouter } from "@/features/credentials/server/routers";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
