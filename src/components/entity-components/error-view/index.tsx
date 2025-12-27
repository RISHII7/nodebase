import { StateViewProps } from "@/types";
import { AlertTriangleIcon } from "lucide-react";


export const ErrorView = ({
  message,
}: StateViewProps) => {
  return (
    <div className="flex justify-center items-center h-full flex-1 flex-col gap-y-4">
      <AlertTriangleIcon className="size-6 text-primary" />
      {!!message && (
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  );
};
