
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
            Projets
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
          
          {/* Toujours afficher le bouton de tableau de bord quand l'utilisateur est connecté */}
          {isLoggedIn && (
            <Button 
              variant="default"
              className="bg-bgs-blue hover:bg-bgs-blue/90 text-white"
              onClick={handleDashboardClick}
            >
              Tableau de bord
            </Button>
          )}
        </div>
      )}
    </>
  );

  return (
    <nav className="hidden md:flex items-center">
      {/* Always render navigation links */}
      {renderNavLinks()}
    </nav>
  );
}
