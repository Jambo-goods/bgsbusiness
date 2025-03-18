
import React from "react";

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-2">
        {title}
      </h2>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

export default SidebarSection;
