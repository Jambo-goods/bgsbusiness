
import { ReactNode, memo } from "react";

interface SidebarSectionProps {
  title?: string;
  expanded: boolean;
  children: ReactNode;
}

const SidebarSection = memo(({ title, expanded, children }: SidebarSectionProps) => {
  return (
    <div className="mb-4">
      {expanded && title && (
        <p className="text-xs font-medium text-bgs-gray-medium uppercase tracking-wider px-3 mb-2 mt-2">
          {title}
        </p>
      )}
      <ul className="space-y-1">
        {children}
      </ul>
    </div>
  );
});

SidebarSection.displayName = "SidebarSection";

export default SidebarSection;
