import { memo, useState } from "react";
import { MousePointerIcon } from "lucide-react";

import { NodeProps } from "@xyflow/react";

import { BaseTriggerNode } from "@/features/triggers/components/base-trigger-node";
import { ManualTriggerDialog } from "@/features/triggers/components/manual-trigger/dialog";

export const ManualTriggerNode = memo(
    (props: NodeProps) => {
        const nodeStatus = "loading";

        const [dialogOpen, setDialogOpen] = useState(false);

        const handleOpenSettings = () => {
            setDialogOpen(true);
        };

        return (
            <>
                <ManualTriggerDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                />
                <BaseTriggerNode
                    {...props}
                    icon={MousePointerIcon}
                    name="When clicking 'Execute workflow'"
                    status={nodeStatus}
                    onSettings={handleOpenSettings}
                    onDoubleClick={handleOpenSettings}
                />
            </>
        )
    }
)