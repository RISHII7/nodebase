import { useRouter } from "next/navigation";

import { useUpgradeModal } from "@/hooks/use-upgrade-modal";

import { EmptyView } from "@/components/entity-components/empty-view";
import { useCreateWorkflow } from "@/features/workflows/hooks/use-workflows";

export const WorkflowsEmpty = () => {
  const router = useRouter();
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onError: (error) => {
        handleError(error);
      },
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
    });
  };

  return (
    <>
      {modal}
      <EmptyView
        onNew={handleCreate}
        message="You haven't created any workflows yest get started by creating your first workflow"
      />
    </>
  );
};
