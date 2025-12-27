import { StateViewProps } from "@/types";
import { Loader2Icon } from "lucide-react";

export const LoadingView = ({
  message,
}: StateViewProps) => {
  return (
    <div className="flex justify-center items-center h-full flex-1 flex-col gap-y-4">
      <Loader2Icon className="size-6 animate-spin text-primary" />
      {!!message && (
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  );
};
