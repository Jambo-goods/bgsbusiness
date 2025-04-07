
import { useState } from "react";
import { UserCircle, Settings, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "@/services/authService";
import { toast } from "sonner";

export default function UserMenuDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };
  
  const handleLogout = async () => {
    // Clear storage immediately
    localStorage.clear();
    sessionStorage.clear();
    
    // Execute the logout
    const { success, error } = await logoutUser();
    
    if (success) {
      toast.success("Déconnexion réussie");
    } else {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
    }
    
    // Always force redirect regardless of success/failure
    // This ensures user gets logged out even if there's an API error
    window.location.href = "/login";
  };
  
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
      >
        <UserCircle className="h-5 w-5 text-gray-700" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg z-50 border border-gray-100 animate-fade-in">
          <div className="py-3 px-4 border-b border-gray-100">
            <p className="text-sm font-medium text-bgs-blue">Compte utilisateur</p>
            <p className="text-xs text-gray-500 mt-0.5">Gérez vos informations</p>
          </div>
          <div className="py-2">
            <Link to="/dashboard/profile" className={`flex items-center px-4 py-2.5 text-sm ${isActive('/profile') ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
              <UserCircle className="h-4 w-4 mr-3 text-bgs-blue" />
              Mon Profil
            </Link>
            <Link to="/dashboard/settings" className={`flex items-center px-4 py-2.5 text-sm ${isActive('/settings') ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
              <Settings className="h-4 w-4 mr-3 text-bgs-blue" />
              Paramètres
            </Link>
            <hr className="my-1" />
            <button 
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
