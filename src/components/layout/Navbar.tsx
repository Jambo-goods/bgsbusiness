
import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    setIsLoggedIn(!!storedUser);

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
    });
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;
  
  const logoPath = "lovable-uploads/d9a3204a-06aa-470d-8255-7f3bd0852557.png";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src={logoPath}
            alt="BGS Business Club"
            className="h-12 md:h-14 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 items-center">
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
          
          {isLoggedIn ? (
            <>
              <button onClick={handleLogout} className="btn-secondary">
                Déconnexion
              </button>
              <Link to="/dashboard" className="btn-primary">
                Tableau de bord
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Connexion
              </Link>
              <Link to="/register" className="btn-primary">
                S'inscrire
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-bgs-blue hover:text-bgs-orange transition-colors"
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 right-0 shadow-md animate-fade-in">
          <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
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
            <div className="pt-2 flex flex-col space-y-3">
              {isLoggedIn ? (
                <>
                  <button onClick={handleLogout} className="btn-secondary w-full text-center">
                    Déconnexion
                  </button>
                  <Link to="/dashboard" className="btn-primary w-full text-center">
                    Tableau de bord
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary w-full text-center">
                    Connexion
                  </Link>
                  <Link to="/register" className="btn-primary w-full text-center">
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
