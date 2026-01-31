"use client"

import { memo } from "react";
import { PlusIcon } from "lucide-react";
import type { NodeProps } from "@xyflow/react";

import { PlaceholderNode } from "@/components/react-flow/placeholder-node";
import { WorkflowNode } from "../workflow-node";

export const InitialNode = memo((props: NodeProps) => {
    return (
        <WorkflowNode showToolbar={false}>
            <PlaceholderNode
            {...props}
            onClick={() => {}}

            >
                <div className="cursor-pointer flex items-center justify-center">
                    <PlusIcon className="size-4" />
                </div>
            </PlaceholderNode>
        </WorkflowNode>
    )
});

InitialNode.displayName = "InitialNode";