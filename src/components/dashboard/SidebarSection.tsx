
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SidebarSectionProps {
  title?: string;
  expanded: boolean;
  children: ReactNode;
}

export default function SidebarSection({ title, expanded, children }: SidebarSectionProps) {
  return (
    <div className={cn(
      "mb-4",
      expanded ? "px-1" : "px-0"
    )}>
      {expanded && title && (
        <p className="text-xs font-medium text-bgs-gray-medium uppercase tracking-wider px-2 mb-2 mt-2">
          {title}
        </p>
      )}
      <ul className={cn(
        "space-y-1",
        !expanded && "flex flex-col items-center"
      )}>
        {children}
      </ul>
    </div>
  );
}
