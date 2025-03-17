import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UserMenuDropdown from "./UserMenuDropdown";
import NotificationDropdown from "./NotificationDropdown";

export default function NavbarActions() {
  const { pathname } = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
        // Check if user is admin
        const { data } = await supabase.auth.getUser();
        const userRole = data.user?.app_metadata?.role;
        setIsAdmin(userRole === 'admin');
      }
    };
    
    checkAuth();
  }, []);
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Show confirmation toast
      toast.success("Déconnexion réussie");
      
      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Une erreur est survenue lors de la déconnexion");
    }
  };
  
  // Return to admin dashboard button
  const renderAdminButton = () => {
    if (!isAdmin || pathname.includes('/admin')) return null;
    
    return (
      <Button 
        variant="outline" 
        className="hidden md:flex items-center gap-2"
        onClick={() => navigate('/admin/dashboard')}
      >
        <Shield className="h-4 w-4" />
        <span>Admin</span>
      </Button>
    );
  };
  
  // Show login button if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-gray-600 hover:text-gray-900">
          Connexion
        </Link>
        <Button asChild>
          <Link to="/register">S'inscrire</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {renderAdminButton()}
      <NotificationDropdown />
      <UserMenuDropdown onSignOut={handleSignOut} />
    </div>
  );
}
