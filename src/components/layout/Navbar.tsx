
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

  // Set up an auth state change listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed in Navbar:", event);
        if (event === "SIGNED_IN" && session) {
          setIsLoggedIn(true);
          localStorage.setItem('isLoggedIn', 'true');
        } else if (event === "SIGNED_OUT") {
          setIsLoggedIn(false);
          localStorage.setItem('isLoggedIn', 'false');
        }
      }
    );
    
    return () => {
      // Clean up the auth listener when component unmounts
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      const { success, error } = await logoutUser();
      
      if (success) {
        // Immediately update UI state
        setIsLoggedIn(false);
        localStorage.setItem('isLoggedIn', 'false');
        
        toast.success("Déconnexion réussie");
        
        // Navigate to home page after logout
        navigate("/");
      } else {
        toast.error("Erreur lors de la déconnexion: " + error);
      }
    } catch (err) {
      console.error("Unexpected error during logout:", err);
      toast.error("Une erreur inattendue s'est produite lors de la déconnexion");
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
