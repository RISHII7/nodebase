"use client"

import { EntityContainer } from "@/components/entity-components/enitiy-container";
import { WorkflowsHeader } from "@/features/workflows/components/workflows/workflows-header";
import { WorkflowsSearch } from "@/features/workflows/components/workflows/workflows-search";
import { WorkflowsPagination } from "@/features/workflows/components/workflows/workflows-pagination";

export const WorkflowsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<WorkflowsHeader />}
            search={<WorkflowsSearch />}
            pagination={<WorkflowsPagination />}
        >
            {children}
        </EntityContainer>
    )
};