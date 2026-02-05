import { useAtomValue } from "jotai";
import { SaveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { editorAtom } from "@/features/editor/store/atoms";
import { useUpdateWorkflow } from "@/features/workflows/hooks/use-workflows";

export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
    const editor = useAtomValue(editorAtom);
    const saveWorkflow = useUpdateWorkflow();

    const handleSave = () => {
        if (!editor) {
            return
        };

        const nodes = editor.getNodes();
        const edges = editor.getEdges();

        saveWorkflow.mutate({
            id: workflowId,
            nodes,
            edges,
        });
    };

    return (
        <div className="ml-auto">
            <Button
                size="sm"
                onClick={handleSave}
                disabled={saveWorkflow.isPending}
            >
                <SaveIcon className="size-4" />
                Save
            </Button>
        </div>
    )
};