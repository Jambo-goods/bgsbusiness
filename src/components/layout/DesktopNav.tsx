import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
interface DesktopNavProps {
  isLoggedIn: boolean;
  isActive: (path: string) => boolean;
  handleLogout: () => void;
  isOnDashboard?: boolean;
}
export default function DesktopNav({
  isLoggedIn,
  isActive,
  handleLogout,
  isOnDashboard = false
}: DesktopNavProps) {
  return <nav className="hidden md:flex space-x-8 items-center">
      <Link to="/" className={cn("nav-link", isActive("/") && "active")}>
        Accueil
      </Link>
      <Link to="/projects" className={cn("nav-link", isActive("/projects") && "active")}>
        Projets
      </Link>
      
      <Link to="/about" className={cn("nav-link", isActive("/about") && "active")}>
        À propos
      </Link>
      
      {isLoggedIn ? !isOnDashboard && <>
            <button onClick={handleLogout} className="btn-secondary">
              Déconnexion
            </button>
            <Link to="/dashboard" className="btn-primary">
              Tableau de bord
            </Link>
          </> : <>
          <Link to="/login" className="btn-secondary">
            Connexion
          </Link>
          <Link to="/register" className="btn-primary">
            S'inscrire
          </Link>
        </>}
    </nav>;
}