
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

  // Render navigation links
  const renderNavLinks = () => (
    <>
      {!isOnDashboard && (
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
      )}
    </>
  );

  return (
    <nav className="hidden md:flex space-x-8 items-center">
      {/* Always render navigation links */}
      {renderNavLinks()}
      
      {/* Show dashboard button immediately with correct visibility based on auth state */}
      <div className={cn("ml-auto", !authChecked && "opacity-0", "transition-opacity duration-150")}>
        {/* When not authenticated yet, show placeholder button that will be replaced by proper buttons */}
        {!authChecked && (
          <Button 
            variant="default"
            className="bg-bgs-blue hover:bg-bgs-blue/90 text-white"
            disabled
          >
            Tableau de bord
          </Button>
        )}
        
        {/* Only show when auth is checked and user is logged in and not on dashboard */}
        {authChecked && isLoggedIn && !isOnDashboard && (
          <Button 
            variant="default"
            className="bg-bgs-blue hover:bg-bgs-blue/90 text-white"
            onClick={handleDashboardClick}
          >
            Tableau de bord
          </Button>
        )}
        
        {/* Only show login/register buttons ONLY when auth is checked and user is NOT logged in */}
        {authChecked && !isLoggedIn && (
          <div className="flex space-x-3">
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
      </div>
    </nav>
  );
}
