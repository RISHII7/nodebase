import { useSuspenseWorkflows } from "@/features/workflows/hooks/use-workflows";
import { useWorkflowsParams } from "@/features/workflows/hooks/use-workflows-params";

import { EntityPagination } from "@/components/entity-components/entity-pagination";

export const WorkflowsPagination = () => {
    const workflows = useSuspenseWorkflows();
    const [params,setParams] = useWorkflowsParams();

    return (
        <EntityPagination 
            disabled={workflows.isFetching}
            totalPages={workflows.data.totalPages}
            page={workflows.data.page}
            onPageChange={(page) => setParams({
                ...params,
                page
            })}
        />
    )
}