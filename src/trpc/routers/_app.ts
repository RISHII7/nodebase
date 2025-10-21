import { createTRPCRouter } from "@/trpc/init";
import { workflowsRouter } from "@/features/workflows/servers/routers";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
