
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import NavbarActions from "./navbar/NavbarActions";

interface NavbarHeaderProps {
  isScrolled: boolean;
  children?: React.ReactNode;
}

export default function NavbarHeader({ isScrolled, children }: NavbarHeaderProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };
  
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white shadow-sm"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {children}
          <NavbarActions isActive={isActive} />
        </div>
      </div>
    </header>
  );
}
