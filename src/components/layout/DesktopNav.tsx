
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DesktopNavProps {
  isLoggedIn: boolean;
  isActive: (path: string) => boolean;
  handleLogout: () => void;
  isOnDashboard?: boolean;
  authChecked?: boolean;
}

export default function DesktopNav({ 
  isLoggedIn, 
  isActive, 
  handleLogout,
  isOnDashboard = false
}: DesktopNavProps) {
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate("/dashboard", { replace: true });
  };

  // Render navigation links
  const renderNavLinks = () => (
    <>
      {!isOnDashboard && (
        <div className="nav-items-container flex items-center space-x-8">
          <Link
            to="/"
            className={cn("nav-link", isActive("/") && "active")}
          >
            Accueil
          </Link>
          <Link
            to="/projects"
            className={cn("nav-link", isActive("/projects") && "active")}
          >
            Opportunité
          </Link>
          <Link
            to="/how-it-works"
            className={cn("nav-link", isActive("/how-it-works") && "active")}
          >
            Comment ça marche
          </Link>
          <Link
            to="/about"
            className={cn("nav-link", isActive("/about") && "active")}
          >
            À propos
          </Link>
          <Link
            to="/users"
            className={cn("nav-link", isActive("/users") && "active")}
          >
            Utilisateurs
          </Link>
          
          {/* Authentication buttons */}
          {isLoggedIn ? (
            <Button 
              variant="default"
              className="bg-bgs-blue hover:bg-bgs-blue/90 text-white will-change-transform"
              onClick={handleDashboardClick}
            >
              Tableau de bord
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                className="border-bgs-blue text-bgs-blue hover:bg-bgs-gray-light"
                onClick={() => navigate("/login")}
              >
                Connexion
              </Button>
              <Button 
                variant="default"
                className="bg-bgs-blue hover:bg-bgs-blue/90 text-white"
                onClick={() => navigate("/register")}
              >
                Inscription
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <nav className="hidden md:flex items-center contain-paint">
      {/* Always render navigation links */}
      {renderNavLinks()}
    </nav>
  );
}
