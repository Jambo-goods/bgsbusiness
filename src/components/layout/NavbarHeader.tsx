
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import NavbarActions from "./navbar/NavbarActions";

interface NavbarHeaderProps {
  isScrolled: boolean;
  isLoggedIn?: boolean;
  children?: React.ReactNode;
}

export default function NavbarHeader({ isScrolled, isLoggedIn = false, children }: NavbarHeaderProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };
  
  const isDashboardPage = location.pathname.includes('/dashboard');
  
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
          {/* Only show NavbarActions when logged in and on dashboard */}
          {isLoggedIn && isDashboardPage && <NavbarActions isActive={isActive} />}
        </div>
      </div>
    </header>
  );
}
