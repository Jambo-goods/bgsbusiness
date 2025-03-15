
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import UserMenuDropdown from "./UserMenuDropdown";
import DashboardMenuDropdown from "./DashboardMenuDropdown";
import { useAuth } from "@/contexts/AuthContext";

export default function NavbarActions() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Don't show auth buttons on auth pages
  const isAuthPage = 
    location.pathname === "/login" || 
    location.pathname === "/register" || 
    location.pathname === "/forgot-password";
    
  if (isAuthPage) return null;
  
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {isAuthenticated ? (
        <>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              Tableau de bord
            </Button>
          </Link>
          <UserMenuDropdown />
        </>
      ) : (
        <>
          <Link to="/login">
            <Button variant="ghost" size="sm">Connexion</Button>
          </Link>
          <Link to="/register">
            <Button variant="default" size="sm">Créer un compte</Button>
          </Link>
        </>
      )}
    </div>
  );
}
