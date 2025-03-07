
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
      "mb-2",
      expanded ? "px-3" : "px-1"
    )}>
      {expanded && title && (
        <p className="text-xs font-medium text-bgs-gray-medium uppercase tracking-wider px-2 mb-3 mt-1">
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
