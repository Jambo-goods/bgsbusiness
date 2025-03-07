
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavbarHeader from "./NavbarHeader";
import DesktopNav from "./DesktopNav";
import MobileMenu from "./MobileMenu";
import MobileMenuToggle from "./MobileMenuToggle";
import { cn } from "@/lib/utils";
import { useNavScroll } from "@/hooks/useNavScroll";

interface NavbarProps {
  isScrolled?: boolean;
  isOnDashboard?: boolean;
}

export default function Navbar({ isScrolled, isOnDashboard }: NavbarProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrolled = useNavScroll();
  
  // Use the passed isScrolled prop or the hook result
  const shouldShowBackground = isScrolled !== undefined ? isScrolled : scrolled;
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Mock functions for this component (in a real app, these would be implemented)
  const isLoggedIn = false; // This would be from a hook or context
  const isActive = (path: string) => location.pathname === path;
  const handleLogout = () => console.log("Logout");
  
  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        shouldShowBackground ? "bg-white shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <NavbarHeader isScrolled={shouldShowBackground} />
          
          <DesktopNav 
            isLoggedIn={isLoggedIn} 
            isActive={isActive} 
            handleLogout={handleLogout} 
            isOnDashboard={isOnDashboard}
            isScrolled={shouldShowBackground}
          />
          
          <MobileMenuToggle 
            isMenuOpen={isMobileMenuOpen} 
            toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isScrolled={shouldShowBackground}
          />
        </div>
      </div>
      
      <MobileMenu 
        isMenuOpen={isMobileMenuOpen} 
        isLoggedIn={isLoggedIn} 
        isActive={isActive} 
        handleLogout={handleLogout}
        isOnDashboard={isOnDashboard}
      />
    </nav>
  );
}
