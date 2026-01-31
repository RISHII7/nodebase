"use client"

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { memo, type ReactNode } from "react";

import { NodeProps, Position } from "@xyflow/react";

import { WorkflowNode } from "@/components/workflow-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";

interface BaseTriggerNodeProps extends NodeProps {
    icon: LucideIcon | string;
    name: string;
    description?: string;
    children?: ReactNode;
    // status?: NodeStatus;
    onSettings?: () => void;
    onDoubleClick?: () => void;
};

export const BaseTriggerNode = memo(
    ({
        id,
        icon: Icon,
        name,
        description,
        children,
        onSettings,
        onDoubleClick,
    }: BaseTriggerNodeProps) => {
        // TODO: Implement delete functionality
        const handleDelete = () => {

        }

        return (
            <WorkflowNode
                name={name}
                description={description}
                onDelete={handleDelete}
                onSettings={onSettings}
            >
                {/* TODO: Wrap between node status indicator */}
                <BaseNode onDoubleClick={onDoubleClick} className="rounded-l-2xl relative group">
                    <BaseNodeContent>
                        {typeof Icon === "string" ? (
                            <Image
                                src={Icon}
                                alt={name}
                                width={16}
                                height={16}
                            />
                        ) : (
                            <Icon className="size-5" />
                        )}
                        {children}
                        <BaseHandle
                            id="source-1"
                            type="source"
                            position={Position.Right}
                        />
                    </BaseNodeContent>
                </BaseNode>
            </WorkflowNode>
        )
    },
);

BaseTriggerNode.displayName = "BaseTriggerNode";


