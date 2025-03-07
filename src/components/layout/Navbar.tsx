
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await getCurrentUser();
      setIsLoggedIn(!!user);
      setAuthChecked(true);
      console.log("Auth check on route change:", !!user ? "Logged in" : "Not logged in");
    };
    
    checkAuth();
  }, [location.pathname]);

  useEffect(() => {
    const checkAuthOnMount = async () => {
      const { user } = await getCurrentUser();
      setIsLoggedIn(!!user);
      setAuthChecked(true);
      console.log("Auth check on mount:", !!user ? "Logged in" : "Not logged in");
    };
    
    checkAuthOnMount();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const authenticated = !!session?.user;
        console.log("Auth state changed:", event, authenticated ? "Logged in" : "Not logged in");
        setIsLoggedIn(authenticated);
        setAuthChecked(true);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    const { success, error } = await logoutUser();
    
    if (success) {
      setIsLoggedIn(false);
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

  // Don't render anything until auth check is complete
  if (!authChecked) {
    return (
      <NavbarHeader isScrolled={effectiveIsScrolled} isLoggedIn={false}>
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <NavLogo logoPath={logoPath} />
        </div>
      </NavbarHeader>
    );
  }

  return (
    <NavbarHeader isScrolled={effectiveIsScrolled} isLoggedIn={isLoggedIn}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <NavLogo logoPath={logoPath} />

        <DesktopNav 
          isLoggedIn={isLoggedIn}
          isActive={isActive}
          handleLogout={handleLogout}
          isOnDashboard={effectiveIsOnDashboard}
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
      />
    </NavbarHeader>
  );
}
