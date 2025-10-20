import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(({ ctx }) => {

    return prisma.user.findMany({
      where:{
        id: ctx.auth.user.id
      }
    });
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
