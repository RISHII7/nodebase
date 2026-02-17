import { NonRetriableError } from "inngest";

import prisma from "@/lib/db";
import { NodeType } from "@/generated/prisma";

import { inngest } from "@/inngest/client";
import { topologicalSort } from "@/inngest/utils";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";

import { getExecutor } from "@/features/executions/lib/executor-registry";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow", retries: 0 /* TODO: Remove in Production */ },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is required");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      return topologicalSort(workflow.nodes, workflow.connections);
    });

    // Initialize the context with any initial data from the trigger
    let context = event.data.initialData || {};

    // Execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish,
      });
    }

    return {
      workflowId,
      result: context,
    };
  },
);
