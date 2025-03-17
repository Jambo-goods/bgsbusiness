
import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  expanded: boolean;
  labelPosition?: "right" | "tooltip";
}

export default function SidebarNavItem({
  icon: Icon,
  label,
  value,
  activeTab,
  setActiveTab,
  expanded,
  labelPosition = "right"
}: SidebarNavItemProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    console.log(`SidebarNavItem clicked: ${value}`);
    setActiveTab(value);
    
    // Update URL with query parameter for direct access
    if (value === 'overview') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard?tab=${value}`);
    }
  };

  const isActive = activeTab === value;
  console.log(`SidebarNavItem ${value} - isActive: ${isActive}, activeTab: ${activeTab}`);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center w-full py-2 px-3 my-1 rounded-lg text-left transition-colors duration-200",
        "text-sm font-medium",
        "hover:bg-gray-100",
        isActive ? "bg-blue-50 text-bgs-blue" : "text-gray-700"
      )}
      title={expanded ? undefined : label}
    >
      <Icon
        className={cn(
          "h-5 w-5 flex-shrink-0",
          isActive ? "text-bgs-blue" : "text-gray-500"
        )}
      />
      
      {(expanded || labelPosition === "tooltip") && (
        <span 
          className={cn(
            "transition-all duration-200",
            expanded ? "ml-3 opacity-100" : "opacity-0 absolute",
            labelPosition === "tooltip" && !expanded ? "ml-8 bg-gray-800 text-white py-1 px-2 rounded text-xs" : ""
          )}
        >
          {label}
        </span>
      )}
    </button>
  );
}
