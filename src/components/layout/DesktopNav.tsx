
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DesktopNavProps {
  isLoggedIn: boolean;
  isActive: (path: string) => boolean;
  handleLogout: () => void;
  isOnDashboard?: boolean;
  authChecked: boolean;
}

export default function DesktopNav({ 
  isLoggedIn, 
  isActive, 
  handleLogout,
  isOnDashboard = false,
  authChecked = false
}: DesktopNavProps) {
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    // Use replace to prevent back navigation to public routes after entering dashboard
    navigate("/dashboard", { replace: true });
  };

  // Fixed navigation links that should always be visible regardless of auth state
  const renderNavLinks = () => (
    <>
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
    </>
  );

  return (
    <nav className="hidden md:flex space-x-8 items-center">
      {/* Always render main navigation links */}
      {renderNavLinks()}
      
      {/* Always show dashboard button for logged in users, make it fixed in position */}
      {isLoggedIn && authChecked && (
        <Button 
          variant="default"
          className="bg-bgs-blue hover:bg-bgs-blue/90 text-white ml-auto fixed-nav-button"
          onClick={handleDashboardClick}
        >
          Tableau de bord
        </Button>
      )}
      
      {/* Show login/register buttons ONLY when NOT logged in and auth is checked */}
      {!isLoggedIn && authChecked && (
        <div className="flex ml-auto space-x-3">
          <Button 
            variant="outline"
            className="border-bgs-blue text-bgs-blue hover:bg-bgs-blue/10"
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
    </nav>
  );
}
