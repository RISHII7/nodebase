"use client";

import { memo, useState } from "react";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";

import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import {
  OpenAiDialog,
  OpenAiFormValues,
} from "@/features/executions/components/openai/dialog";
import { fetchOpenAiRealtimeToken } from "@/features/executions/components/openai/actions";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai";

type OpenAiNodeData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

type OpenAiNodeType = Node<OpenAiNodeData>;

export const OpenAiNode = memo((props: NodeProps<OpenAiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPENAI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchOpenAiRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: OpenAiFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };

  const nodeData = props.data;
  const description = nodeData.userPrompt
    ? `gpt-4.1-mini: ${nodeData.userPrompt.slice(1, 50)}...`
    : "Not configured";

  return (
    <>
      <OpenAiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/openai.svg"
        name="OpenAI"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

OpenAiNode.displayName = "OpenAiNode";
