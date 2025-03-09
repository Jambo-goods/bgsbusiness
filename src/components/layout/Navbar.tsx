
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import NavbarHeader from "./NavbarHeader";
import NavLogo from "./NavLogo";
import DesktopNav from "./DesktopNav";
import MobileMenuToggle from "./MobileMenuToggle";
import MobileMenu from "./MobileMenu";
import { logoutUser, getCurrentUser } from "@/services/authService";

interface NavbarProps {
  isScrolled?: boolean;
  isOnDashboard?: boolean;
}

export default function Navbar({ isScrolled, isOnDashboard = false }: NavbarProps) {
  const [internalIsScrolled, setInternalIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Initialize with value from localStorage (if available) for immediate rendering
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedAuthState = localStorage.getItem('isLoggedIn');
    return savedAuthState === 'true';
  });
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  
  const logoPath = "lovable-uploads/d9a3204a-06aa-470d-8255-7f3bd0852557.png";
  
  const effectiveIsOnDashboard = isOnDashboard || location.pathname.startsWith('/dashboard');

  const effectiveIsScrolled = isScrolled !== undefined ? isScrolled : internalIsScrolled;

  useEffect(() => {
    if (isScrolled === undefined) {
      const handleScroll = () => {
        setInternalIsScrolled(window.scrollY > 10);
      };
      
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isScrolled]);

  // Fast auth check using local storage + async validation
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await getCurrentUser();
        const authenticated = !!user;
        setIsLoggedIn(authenticated);
        
        // Save to localStorage for faster future loads
        localStorage.setItem('isLoggedIn', authenticated ? 'true' : 'false');
        
        setAuthChecked(true);
        console.log("Auth check completed:", authenticated ? "Logged in" : "Not logged in");
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
        localStorage.setItem('isLoggedIn', 'false');
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, []);

  // Manual auth state checking instead of real-time subscription
  useEffect(() => {
    const checkAuthInterval = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      const authenticated = !!data.session?.user;
      if (authenticated !== isLoggedIn) {
        setIsLoggedIn(authenticated);
        localStorage.setItem('isLoggedIn', authenticated ? 'true' : 'false');
      }
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(checkAuthInterval);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    const { success, error } = await logoutUser();
    
    if (success) {
      setIsLoggedIn(false);
      localStorage.setItem('isLoggedIn', 'false');
      toast.success("Déconnexion réussie");
      
      uiToast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      
      navigate("/");
    } else {
      toast.error("Erreur lors de la déconnexion: " + error);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <NavbarHeader isScrolled={effectiveIsScrolled} isLoggedIn={isLoggedIn}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between contain-layout">
        <NavLogo logoPath={logoPath} />

        <DesktopNav 
          isLoggedIn={isLoggedIn}
          isActive={isActive}
          handleLogout={handleLogout}
          isOnDashboard={effectiveIsOnDashboard}
          authChecked={authChecked}
        />

        <MobileMenuToggle 
          isMenuOpen={isMenuOpen} 
          toggleMenu={toggleMenu} 
        />
      </div>

      <MobileMenu 
        isMenuOpen={isMenuOpen}
        isLoggedIn={isLoggedIn}
        isActive={isActive}
        handleLogout={handleLogout}
        isOnDashboard={effectiveIsOnDashboard}
        authChecked={authChecked}
      />
    </NavbarHeader>
  );
}
