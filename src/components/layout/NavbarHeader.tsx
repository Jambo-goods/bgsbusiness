
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import NavbarActions from "./navbar/NavbarActions";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarHeaderProps {
  isScrolled: boolean;
  isLoggedIn?: boolean;
  children?: React.ReactNode;
}

export default function NavbarHeader({ isScrolled, isLoggedIn = false, children }: NavbarHeaderProps) {
  const location = useLocation();
  const { user } = useAuth();
  
  const isDashboardPage = location.pathname.includes('/dashboard');
  
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        isScrolled
          ? "bg-white/98 backdrop-blur-sm shadow-sm py-2"
          : "bg-white py-3"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {children}
          {(!!user || isLoggedIn) && isDashboardPage && (
            <NavbarActions />
          )}
        </div>
      </div>
    </header>
  );
}
