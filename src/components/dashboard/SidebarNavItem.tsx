
import React from "react";

interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isOpen: boolean;
  badge?: string;
  badgeColor?: string;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ 
  icon, 
  label, 
  isActive, 
  onClick, 
  isOpen,
  badge,
  badgeColor = "bg-bgs-blue"
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center px-2 py-1.5 rounded-md transition-colors text-sm
        ${isActive 
          ? "bg-bgs-blue/10 text-bgs-blue font-medium" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }
      `}
    >
      <div className="flex-shrink-0 text-current">
        {icon}
      </div>
      
      {isOpen && (
        <div className="ml-3 flex-1 flex justify-between items-center">
          <span className="truncate">{label}</span>
          
          {badge && (
            <span className={`${badgeColor} text-white text-xs px-1 py-0.5 rounded-full ml-1`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

export default SidebarNavItem;
