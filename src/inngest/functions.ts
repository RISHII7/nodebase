import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // Test 1
    await step.sleep("wait-a-moment", "5s");

    // Test 2
    await step.sleep("wait-a-moment", "5s");

    // Test 3
    await step.sleep("wait-a-moment", "5s");
    
    await step.run("create-workflow", () => {
      return prisma.workflow.create({
        data: {
          name: "workflow-from-inngest"
        },
      });
    });
  },
);