import { NodeType } from "@/generated/prisma";

import { NodeExecutor } from "@/features/executions/types";
import { geminiExecutor } from "@/features/executions/components/gemini/executor";
import { httpRequestExecutor } from "@/features/executions/components/http-request/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { openAiExecutor } from "@/features/executions/components/openai/executor";
import { anthropicExecutor } from "@/features/executions/components/anthropic/executor";
import { discordExecutor } from "@/features/executions/components/discord/executor";
import { slackExecutor } from "@/features/executions/components/slack/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.OPENAI]: openAiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.DISCORD]: discordExecutor,
  [NodeType.SLACK]: slackExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];

  if (!executor) {
    throw new Error(`Executor not found for type ${type}`);
  }

  return executor;
};
