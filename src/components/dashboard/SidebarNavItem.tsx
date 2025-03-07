
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
    <li>
      <button
        onClick={onClick}
        className={cn(
          "flex items-center w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
          variant === "default" && (
            isActive
              ? "bg-bgs-blue text-white font-medium shadow-sm"
              : "text-bgs-blue hover:bg-bgs-gray-light hover:text-bgs-blue"
          ),
          variant === "danger" && "text-red-500 hover:bg-red-50"
        )}
      >
        <Icon size={18} className={expanded ? "mr-3" : "mx-auto"} />
        {expanded && <span className="truncate">{label}</span>}
      </button>
    </li>
  );
}
