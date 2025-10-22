import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";

interface EntitySearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export const EntitySearch = ({ onChange, value, placeholder = "Search" }: EntitySearchProps) => {
    return (
        <div className="relative ml-auto">
            <SearchIcon className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
                className="max-w-[200px] bg-background shadow-none border-border pl-8" 
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
};