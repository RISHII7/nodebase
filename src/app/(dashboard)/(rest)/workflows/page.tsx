import { Suspense } from "react";
import type { SearchParams } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";

import { HydrateClient } from "@/trpc/server";
import { requireAuth } from "@/lib/auth-utils";

import { WorkflowsList } from "@/features/workflows/components/workflows";
import { prefetchWorkflows } from "@/features/workflows/servers/prefetch";
import { WorkflowsContainer } from "@/features/workflows/components/workflows/workflows-container";
import { workflowsParamsLoader } from "@/features/workflows/servers/params-loader";

type Props = {
    searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
    await requireAuth();

    const params = await workflowsParamsLoader(searchParams);
    prefetchWorkflows(params);
    
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