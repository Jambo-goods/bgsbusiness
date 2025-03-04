
import { ReactNode } from "react";

interface SidebarSectionProps {
  title?: string;
  expanded: boolean;
  children: ReactNode;
}

export default function SidebarSection({ title, expanded, children }: SidebarSectionProps) {
  return (
    <div className={expanded ? "px-2 mb-1" : "px-1 mb-1"}>
      {expanded && title && (
        <p className="text-xs font-medium text-bgs-gray-medium uppercase tracking-wider px-3 mb-1 mt-2">
          {title}
        </p>
      )}
      <ul className="space-y-1">
        {children}
      </ul>
    </div>
  );
}
