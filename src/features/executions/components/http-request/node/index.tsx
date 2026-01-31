"use client"

import { memo } from "react";
import { GlobeIcon } from "lucide-react";

import type { Node, NodeProps } from "@xyflow/react";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";

type HttpRequestNodeData = {
    endpoint: "",
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    body?: string,
    [key: string]: unknown,
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo(
    (props: NodeProps<HttpRequestNodeType>) => {
        const nodeData = props.data as HttpRequestNodeData;
        const description = nodeData.endpoint
            ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
            : "Not configured";

        return (
            <>
                <BaseExecutionNode
                    {...props}
                    id={props.id}
                    icon={GlobeIcon}
                    name="HTTP Module"
                    description={description}
                    onSettings={() => { }}
                    onDoubleClick={() => { }}
                />
            </>
        )
    }
);

HttpRequestNode.displayName = "HttpRequestNode";
