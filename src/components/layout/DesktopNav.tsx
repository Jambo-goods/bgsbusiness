
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
      
      {/* Only show dashboard button when logged in and not on dashboard */}
      <div className="ml-auto">
        {isLoggedIn && !isOnDashboard && (
          <Button 
            variant="default"
            className="bg-bgs-blue hover:bg-bgs-blue/90 text-white"
            onClick={handleDashboardClick}
          >
            Tableau de bord
          </Button>
        )}
      </div>
    </nav>
  );
}
