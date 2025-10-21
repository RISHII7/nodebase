import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { HydrateClient } from "@/trpc/server";
import { requireAuth } from "@/lib/auth-utils";

import { WorkflowsList } from "@/features/workflows/components/workflows";
import { prefetchWorkflows } from "@/features/workflows/servers/prefetch";
import { WorkflowsContainer } from "@/features/workflows/components/workflows/workflows-container";

const Page = async () => {
    await requireAuth();

    prefetchWorkflows();
    
    return (
        <WorkflowsContainer>
            <HydrateClient>
                <ErrorBoundary fallback={<p>Error!</p>}>
                <Suspense fallback={<p>Loading...</p>}>
                    <WorkflowsList />
                </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </WorkflowsContainer>
     );
};
 
export default Page;