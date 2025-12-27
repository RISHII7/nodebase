import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { HydrateClient } from "@/trpc/server";

import { requireAuth } from "@/lib/auth-utils";

import { prefetchWorkflow } from "@/features/workflows/servers/prefetch";

import { Editor } from "@/features/editor/components/editor";
import { EditorError } from "@/features/editor/components/editor-error";
import { EditorLoading } from "@/features/editor/components/editor-loading";
import { EditorHeader } from "@/features/editor/components/editor-header";

interface PageProps {
    params: Promise<{
        workflowId: string;
    }>
};

const Page = async ({ params }: PageProps ) => {
    await requireAuth();
    
    const { workflowId } = await params;
    prefetchWorkflow(workflowId);

    return ( 
        <HydrateClient>
            <ErrorBoundary fallback={<EditorError />}>
                <Suspense fallback={<EditorLoading />}>
                    <EditorHeader workflowId={workflowId} />
                    <main className="flex-1">
                        <Editor workflowId={workflowId} />
                    </main>
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
     );
};
 
export default Page;