
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
          "flex items-center w-full rounded-lg text-sm transition-all duration-200",
          expanded ? "px-3 py-2.5" : "p-2.5 justify-center",
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
          strokeWidth={1.75}
          className={cn(
            "transition-all duration-200 flex-shrink-0",
            expanded ? "mr-3" : "",
            isActive 
              ? "text-white" 
              : variant === "default" 
                ? "text-bgs-blue-light" 
                : "text-red-500"
          )} 
          aria-hidden="true"
        />
        {expanded && (
          <span className={cn(
            "truncate transition-opacity duration-200 text-sm",
            isActive ? "opacity-100" : "opacity-80"
          )}>
            {label}
          </span>
        )}
      </button>
    </li>
  );
}
