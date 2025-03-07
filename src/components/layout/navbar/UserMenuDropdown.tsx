
import { UserCircle, Settings, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "@/services/authService";
import { toast } from "sonner";

interface UserMenuDropdownProps {
  isOpen: boolean;
  isActive: (path: string) => boolean;
}

export default function UserMenuDropdown({ isOpen, isActive }: UserMenuDropdownProps) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;
  
  const handleLogout = async () => {
    const { success, error } = await logoutUser();
    
    if (success) {
      toast.success("Déconnexion réussie");
      // Use replace instead of push to prevent back navigation to authenticated routes
      navigate("/", { replace: true });
    } else {
      toast.error("Erreur lors de la déconnexion: " + error);
    }
  };
  
  return (
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
  );
}
