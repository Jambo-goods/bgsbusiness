
import React from "react";

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold text-bgs-blue uppercase tracking-wide ml-2 mb-2">
        {title}
      </h2>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

export default SidebarSection;
