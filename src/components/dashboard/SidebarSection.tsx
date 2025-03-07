
import { ReactNode } from "react";

interface SidebarSectionProps {
  title?: string;
  expanded: boolean;
  children: ReactNode;
}

export default function SidebarSection({ title, expanded, children }: SidebarSectionProps) {
  return (
    <div className={expanded ? "mr-6" : "mr-4"}>
      {expanded && title && (
        <p className="text-xs font-medium text-bgs-gray-medium uppercase tracking-wider px-3 mb-2 mt-2">
          {title}
        </p>
      )}
      <ul className="flex flex-row space-x-2">
        {children}
      </ul>
    </div>
  );
}
