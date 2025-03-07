
import React from "react";
import { Link } from "react-router-dom";
import NavLogo from "./NavLogo";
import MobileMenuToggle from "./MobileMenuToggle";
import MobileMenu from "./MobileMenu";
import DesktopNav from "./DesktopNav";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface NavbarProps {
  isScrolled?: boolean;
  hideHowItWorks?: boolean;
}

export default function DashboardNavbar({ isScrolled = false }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Custom nav items without "How it works" for dashboard
  const dashboardNavItems = [
    { label: "Accueil", href: "/" },
    { label: "Projets", href: "/projects" },
    { label: "À propos", href: "/about" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm py-2"
          : "bg-white py-3"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <NavLogo />
          <nav className="hidden md:block">
            <DesktopNav navItems={dashboardNavItems} />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-3">
            <Button asChild variant="outline">
              <Link to="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link to="/register">S'inscrire</Link>
            </Button>
          </div>

          <MobileMenuToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>
      </div>

      <MobileMenu isOpen={isMobileMenuOpen} navItems={dashboardNavItems} />
    </header>
  );
}
