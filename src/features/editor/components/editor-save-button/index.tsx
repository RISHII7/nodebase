import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";

export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
    return (
        <div className="ml-auto">
            <Button 
                size="sm" 
                onClick={() => {}}
                disabled={false}
            >
                <SaveIcon className="size-4" />
                Save
            </Button>
        </div>
    )
};