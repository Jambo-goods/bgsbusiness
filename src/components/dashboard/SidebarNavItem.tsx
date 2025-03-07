
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  expanded: boolean;
  onClick: () => void;
  variant?: "default" | "danger";
}

export default function SidebarNavItem({
  icon: Icon,
  label,
  isActive,
  expanded,
  onClick,
  variant = "default",
}: SidebarNavItemProps) {
  return (
    <li className="relative">
      <button
        onClick={onClick}
        title={!expanded ? label : undefined}
        className={cn(
          "flex items-center w-full px-3 py-3.5 rounded-lg text-sm transition-all duration-200",
          variant === "default" && (
            isActive
              ? "bg-gradient-to-r from-bgs-blue to-bgs-blue-light text-white font-medium shadow-sm"
              : "text-bgs-blue hover:bg-gray-100 hover:text-bgs-blue"
          ),
          variant === "danger" && "text-red-500 hover:bg-red-50"
        )}
      >
        <Icon 
          size={expanded ? 18 : 20} 
          className={cn(
            "transition-all duration-200",
            expanded ? "mr-3" : "mx-auto",
            isActive ? "text-white" : "text-bgs-blue-light"
          )} 
        />
        {expanded && (
          <span className={cn(
            "truncate transition-opacity duration-200",
            isActive ? "opacity-100" : "opacity-80"
          )}>
            {label}
          </span>
        )}
      </button>
    </li>
  );
}
