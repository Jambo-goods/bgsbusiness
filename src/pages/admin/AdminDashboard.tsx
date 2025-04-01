
import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { logoutAdmin } from '@/services/adminAuthService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  LayoutDashboard, Users, ArrowLeftRight, 
  BanknoteIcon, LogOut, Settings, CalendarIcon
} from 'lucide-react';

export default function AdminDashboard() {
  const { adminUser, setAdminUser } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutAdmin();
    setAdminUser(null);
    toast.success("Déconnexion réussie");
    navigate("/admin/login");
  };

  if (!adminUser) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-bgs-blue text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">BGS Admin Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <div className="font-medium">
                {adminUser.first_name} {adminUser.last_name}
              </div>
              <div className="text-white/70 text-xs">{adminUser.email}</div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-bgs-blue-light rounded-full"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-8 px-4">
        {/* The h2 heading has been removed */}
        
        {/* The grid section has been removed as requested */}
      </div>
    </div>
  );
}
