
import { Menu, X } from "lucide-react";

interface MobileMenuToggleProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  isScrolled?: boolean;
}

export default function MobileMenuToggle({ 
  isMenuOpen, 
  toggleMenu,
  isScrolled
}: MobileMenuToggleProps) {
  return (
    <button
      onClick={toggleMenu}
      className="md:hidden text-bgs-blue hover:text-bgs-orange transition-colors"
      aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
    >
      {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
}
