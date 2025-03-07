
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isMenuOpen: boolean;
  isLoggedIn: boolean;
  isActive: (path: string) => boolean;
  handleLogout: () => void;
  isOnDashboard?: boolean;
  authChecked: boolean;
}

export default function MobileMenu({ 
  isMenuOpen, 
  isLoggedIn, 
  isActive, 
  handleLogout,
  isOnDashboard = false,
  authChecked = false
}: MobileMenuProps) {
  const navigate = useNavigate();
  
  if (!isMenuOpen) return null;
  
  // Don't render auth-dependent buttons until auth is checked
  if (!authChecked) {
    return (
      <div className="md:hidden bg-white absolute top-full left-0 right-0 shadow-md animate-fade-in">
        <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
          {/* Hide the home link when on dashboard */}
          {!isOnDashboard && (
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
          )}
          
          {/* Show these links when user is NOT on dashboard */}
          {!isOnDashboard && (
            <>
              <Link
                to="/projects"
                className={cn(
                  "py-2 px-4 rounded-md transition-colors",
                  isActive("/projects") 
                    ? "bg-bgs-gray-light text-bgs-blue font-medium" 
                    : "text-bgs-blue/80 hover:bg-bgs-gray-light"
                )}
              >
                Projets
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
            </>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="md:hidden bg-white absolute top-full left-0 right-0 shadow-md animate-fade-in">
      <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
        {/* Hide the home link when on dashboard */}
        {!isOnDashboard && (
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
        )}
        
        {/* Show these links when user is NOT on dashboard, regardless of login status */}
        {!isOnDashboard && (
          <>
            <Link
              to="/projects"
              className={cn(
                "py-2 px-4 rounded-md transition-colors",
                isActive("/projects") 
                  ? "bg-bgs-gray-light text-bgs-blue font-medium" 
                  : "text-bgs-blue/80 hover:bg-bgs-gray-light"
              )}
            >
              Projets
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
          </>
        )}
        
        <div className="pt-2 flex flex-col space-y-3">
          {/* Always show dashboard button for logged in users, no condition on isOnDashboard */}
          {isLoggedIn && (
            <Button
              variant="default"
              className="bg-bgs-blue hover:bg-bgs-blue/90 text-white w-full fixed-nav-button"
              onClick={() => navigate("/dashboard", { replace: true })}
            >
              Tableau de bord
            </Button>
          )}
          
          {/* Show login/register buttons ONLY when NOT logged in */}
          {!isLoggedIn && (
            <>
              <Button 
                variant="outline"
                className="border-bgs-blue text-bgs-blue hover:bg-bgs-blue/10 w-full"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
