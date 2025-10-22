import { useEntitySearch } from "@/hooks/use-entity-search";

import { EntitySearch } from "@/components/entity-components/entity-search";
import { useWorkflowsParams } from "@/features/workflows/hooks/use-workflows-params";

export const WorkflowsSearch = () => {
    const [params, setParams] = useWorkflowsParams();
    const { searchValue, onSearchChange } = useEntitySearch({
        params,
        setParams,
    });

    return (
        <EntitySearch 
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search Workflows"
        />
    );
};