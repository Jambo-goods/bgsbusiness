
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isMenuOpen: boolean;
  isLoggedIn: boolean;
  isActive: (path: string) => boolean;
  handleLogout: () => void;
  isOnDashboard?: boolean;
  authChecked?: boolean;
}

export default function MobileMenu({ 
  isMenuOpen, 
  isLoggedIn, 
  isActive, 
  handleLogout,
  isOnDashboard = false
}: MobileMenuProps) {
  const navigate = useNavigate();
  
  if (!isMenuOpen) return null;
  
  // Render navigation links
  const renderNavLinks = () => (
    <div className="nav-items-container flex flex-col space-y-4">
      {/* Hide the home link when on dashboard */}
      {!isOnDashboard && (
        <>
          <Link
            to="/"
            className={cn(
              "py-2 px-4 rounded-md transition-colors",
              isActive("/") 
                ? "bg-bgs-gray-light text-bgs-blue font-medium" 
                : "text-bgs-blue/80 hover:bg-bgs-gray-light"
            )}
          >
            Accueil
          </Link>
          
          <Link
            to="/projects"
            className={cn(
              "py-2 px-4 rounded-md transition-colors",
              isActive("/projects") 
                ? "bg-bgs-gray-light text-bgs-blue font-medium" 
                : "text-bgs-blue/80 hover:bg-bgs-gray-light"
            )}
          >
            Opportunité
          </Link>
          
          <Link
            to="/how-it-works"
            className={cn(
              "py-2 px-4 rounded-md transition-colors",
              isActive("/how-it-works") 
                ? "bg-bgs-gray-light text-bgs-blue font-medium" 
                : "text-bgs-blue/80 hover:bg-bgs-gray-light"
            )}
          >
            Comment ça marche
          </Link>
          
          <Link
            to="/about"
            className={cn(
              "py-2 px-4 rounded-md transition-colors",
              isActive("/about") 
                ? "bg-bgs-gray-light text-bgs-blue font-medium" 
                : "text-bgs-blue/80 hover:bg-bgs-gray-light"
            )}
          >
            À propos
          </Link>
          
          {/* Authentication buttons */}
          {isLoggedIn ? (
            <Button
              variant="default"
              className="bg-bgs-blue hover:bg-bgs-blue/90 text-white mt-2 will-change-transform"
              onClick={() => navigate("/dashboard")}
            >
              Tableau de bord
            </Button>
          ) : (
            <div className="flex flex-col space-y-2 mt-2">
              <Button 
                variant="outline"
                className="border-bgs-blue text-bgs-blue hover:bg-bgs-gray-light w-full"
                onClick={() => navigate("/login")}
              >
                Connexion
              </Button>
              <Button 
                variant="default"
                className="bg-bgs-blue hover:bg-bgs-blue/90 text-white w-full"
                onClick={() => navigate("/register")}
              >
                Inscription
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
  
  return (
    <div className="md:hidden bg-white absolute top-full left-0 right-0 shadow-md animate-fade-in contain-paint">
      <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
        {renderNavLinks()}
      </div>
    </div>
  );
}
