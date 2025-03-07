
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isMenuOpen: boolean;
  isLoggedIn: boolean;
  isActive: (path: string) => boolean;
  handleLogout: () => void;
  isOnDashboard?: boolean;
}

export default function MobileMenu({ 
  isMenuOpen, 
  isLoggedIn, 
  isActive, 
  handleLogout,
  isOnDashboard = false
}: MobileMenuProps) {
  if (!isMenuOpen) return null;
  
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
          {!isLoggedIn ? (
            // Show login/register buttons only if not logged in
            <>
              <Link to="/login" className="btn-secondary w-full text-center">
                Connexion
              </Link>
              <Link to="/register" className="btn-primary w-full text-center">
                S'inscrire
              </Link>
            </>
          ) : !isOnDashboard ? (
            // Show dashboard button if logged in and not on dashboard
            <Link to="/dashboard" className="btn-primary w-full text-center">
              Tableau de bord
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
