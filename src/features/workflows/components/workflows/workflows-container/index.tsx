"use client"

import { EntityContainer } from "@/components/entity-components/enitiy-container";
import { WorkflowsHeader } from "@/features/workflows/components/workflows/workflows-header";

export const WorkflowsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<WorkflowsHeader />}
            search={<></>}
            pagination={<></>}
        >
            {children}
        </EntityContainer>
    )
};