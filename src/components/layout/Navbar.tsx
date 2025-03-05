
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useNavScroll } from "@/hooks/useNavScroll";
import NavbarHeader from "./NavbarHeader";
import NavLogo from "./NavLogo";
import DesktopNav from "./DesktopNav";
import MobileMenuToggle from "./MobileMenuToggle";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const isScrolled = useNavScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const logoPath = "lovable-uploads/d9a3204a-06aa-470d-8255-7f3bd0852557.png";

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    setIsLoggedIn(!!storedUser);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
    });
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <NavbarHeader isScrolled={isScrolled}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <NavLogo logoPath={logoPath} />

        {/* Desktop Navigation */}
        <DesktopNav 
          isLoggedIn={isLoggedIn}
          isActive={isActive}
          handleLogout={handleLogout}
        />

        {/* Mobile Menu Button */}
        <MobileMenuToggle 
          isMenuOpen={isMenuOpen} 
          toggleMenu={toggleMenu} 
        />
      </div>

      {/* Mobile Navigation */}
      <MobileMenu 
        isMenuOpen={isMenuOpen}
        isLoggedIn={isLoggedIn}
        isActive={isActive}
        handleLogout={handleLogout}
      />
    </NavbarHeader>
  );
}
