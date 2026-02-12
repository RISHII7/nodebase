import { memo, useState } from "react";
import { MousePointerIcon } from "lucide-react";

import { NodeProps } from "@xyflow/react";

import { MANUAL_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/manual-trigger";

import { BaseTriggerNode } from "@/features/triggers/components/base-trigger-node";
import { ManualTriggerDialog } from "@/features/triggers/components/manual-trigger/dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { fetchManualTriggerRealtimeToken } from "@/features/triggers/components/manual-trigger/actions";

export const ManualTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: MANUAL_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchManualTriggerRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={MousePointerIcon}
        name="When clicking 'Execute workflow'"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});
