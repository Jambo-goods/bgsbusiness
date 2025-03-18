
import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { logoutAdmin } from '@/services/adminAuthService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  LayoutDashboard, Users, ArrowLeftRight, 
  BanknoteIcon, LogOut, Settings 
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

  const adminSections = [
    {
      title: "Gestion des projets",
      icon: <LayoutDashboard className="h-8 w-8 text-blue-600" />,
      description: "Gérer les projets d'investissement",
      link: "/admin/projects"
    },
    {
      title: "Demandes de retrait",
      icon: <ArrowLeftRight className="h-8 w-8 text-green-600" />,
      description: "Valider et gérer les demandes de retrait",
      link: "/withdrawal-requests"
    },
    {
      title: "Virements bancaires",
      icon: <BanknoteIcon className="h-8 w-8 text-purple-600" />,
      description: "Superviser les virements entrants",
      link: "/bank-transfers"
    },
    {
      title: "Paiements programmés",
      icon: <BanknoteIcon className="h-8 w-8 text-amber-600" />,
      description: "Gérer les paiements à venir",
      link: "/scheduled-payments"
    },
    {
      title: "Profils utilisateur",
      icon: <Users className="h-8 w-8 text-indigo-600" />,
      description: "Consulter les profils des utilisateurs",
      link: "/profiles"
    },
    {
      title: "Paramètres",
      icon: <Settings className="h-8 w-8 text-gray-600" />,
      description: "Configurer le tableau de bord",
      link: "/admin/settings"
    }
  ];

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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Panneau d'administration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section, index) => (
            <Link 
              key={index} 
              to={section.link}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div>{section.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-gray-600 mt-1">{section.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
