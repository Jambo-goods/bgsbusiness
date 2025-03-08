
import React from "react";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  expanded: boolean;
  badge?: string | number | undefined;
}

export default function SidebarNavItem({
  icon,
  label,
  active,
  onClick,
  expanded,
  badge
}: SidebarNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center px-3 py-2 rounded-md transition-colors",
        "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200",
        active 
          ? "bg-bgs-blue/10 text-bgs-blue font-medium" 
          : "text-gray-700"
      )}
    >
      <div className="flex items-center justify-center">
        <span className={cn(
          "flex-shrink-0",
          active ? "text-bgs-blue" : "text-gray-500"
        )}>
          {icon}
        </span>
      </div>
      
      {expanded && (
        <div className="flex items-center justify-between flex-1 ml-3">
          <span className="text-sm">{label}</span>
          
          {badge !== undefined && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-medium">
              {badge}
            </span>
          )}
        </div>
      )}
      
      {!expanded && badge !== undefined && (
        <span className="absolute -right-1 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-medium">
          {badge}
        </span>
      )}
    </button>
  );
}
