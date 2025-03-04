
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { projects } from "@/data/projects";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import Overview from "@/components/dashboard/Overview";
import Investments from "@/components/dashboard/Investments";
import Settings from "@/components/dashboard/Settings";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    investmentTotal: number;
    projectsCount: number;
  } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Simulate fetching user data
    // In a real app, this would come from an authentication context or API
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData({
        firstName: parsedUser.firstName || "Jean",
        lastName: parsedUser.lastName || "Dupont",
        email: parsedUser.email || "jean.dupont@example.com",
        investmentTotal: 7500,
        projectsCount: 3
      });
    } else {
      // Redirect to login if no user is found
      window.location.href = "/login";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter user's investments (in a real app, this would be user-specific)
  const userInvestments = projects.slice(0, 3);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-bgs-blue">Chargement...</div>
      </div>
    );
  }

  // Render appropriate content based on active tab
  const renderTabContent = () => {
    switch(activeTab) {
      case "overview":
        return (
          <Overview 
            userData={userData} 
            userInvestments={userInvestments} 
            setActiveTab={setActiveTab} 
          />
        );
      case "investments":
        return <Investments userInvestments={userInvestments} />;
      case "settings":
        return <Settings userData={userData} />;
      case "wallet":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-bgs-blue mb-4">Solde disponible</h2>
            <div className="text-3xl font-bold text-bgs-blue mb-4">3,250 €</div>
            <p className="text-sm text-bgs-gray-medium mb-4">Votre solde disponible peut être utilisé pour investir dans de nouveaux projets ou être retiré sur votre compte bancaire.</p>
            <div className="flex space-x-4">
              <button className="btn-primary">Déposer des fonds</button>
              <button className="btn-secondary">Retirer des fonds</button>
            </div>
          </div>
        );
      case "capital":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-bgs-blue mb-4">Capital investi</h2>
            <div className="text-3xl font-bold text-bgs-blue mb-4">{userData.investmentTotal.toLocaleString()} €</div>
            <p className="text-sm text-bgs-gray-medium mb-4">Montant total investi dans les projets actifs.</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-bgs-gray-medium">BGS Wood Africa</span>
                  <span className="font-medium text-bgs-blue">2500 €</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-bgs-gray-medium">BGS Energy</span>
                  <span className="font-medium text-bgs-blue">2000 €</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-bgs-gray-medium">BGS Logistics</span>
                  <span className="font-medium text-bgs-blue">3000 €</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "yield":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-bgs-blue mb-4">Rendement mensuel estimé</h2>
            <div className="text-3xl font-bold text-green-600 mb-4">84 €</div>
            <p className="text-sm text-bgs-gray-medium mb-4">Basé sur un rendement annuel moyen de 13.5% sur votre capital investi.</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-bgs-gray-medium">BGS Wood Africa (12%)</span>
                  <span className="font-medium text-green-600">25 €/mois</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-bgs-gray-medium">BGS Energy (14%)</span>
                  <span className="font-medium text-green-600">23 €/mois</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-bgs-gray-medium">BGS Logistics (15%)</span>
                  <span className="font-medium text-green-600">36 €/mois</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "activeList":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-bgs-blue mb-4">Investissements actifs</h2>
            <div className="space-y-4">
              {userInvestments.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 flex items-center space-x-4">
                  <img 
                    src={project.image} 
                    alt={project.name} 
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-bgs-blue">{project.name}</h3>
                    <p className="text-sm text-bgs-gray-medium">{project.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-bgs-blue">2500 €</div>
                    <div className="text-sm text-green-600">+{project.yield}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "history":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-bgs-blue mb-4">Historique des transactions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Montant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-bgs-gray-light/50">
                    <td className="px-4 py-3 text-sm text-bgs-blue">15/03/2023</td>
                    <td className="px-4 py-3 text-sm text-bgs-blue">Investissement BGS Wood Africa</td>
                    <td className="px-4 py-3 text-sm font-medium text-red-500">-2500 €</td>
                    <td><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">Complété</span></td>
                  </tr>
                  <tr className="hover:bg-bgs-gray-light/50">
                    <td className="px-4 py-3 text-sm text-bgs-blue">10/03/2023</td>
                    <td className="px-4 py-3 text-sm text-bgs-blue">Dépôt par virement</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-500">+3000 €</td>
                    <td><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">Complété</span></td>
                  </tr>
                  <tr className="hover:bg-bgs-gray-light/50">
                    <td className="px-4 py-3 text-sm text-bgs-blue">01/03/2023</td>
                    <td className="px-4 py-3 text-sm text-bgs-blue">Rendement mensuel BGS Logistics</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-500">+36 €</td>
                    <td><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">Complété</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case "transfers":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-bgs-blue mb-4">Dépôt et retrait par virement bancaire</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border p-5 rounded-lg">
                <h3 className="font-medium text-bgs-blue mb-3">Effectuer un dépôt</h3>
                <p className="text-sm text-bgs-gray-medium mb-4">
                  Pour créditer votre compte, veuillez effectuer un virement vers notre compte bancaire en indiquant votre identifiant dans la référence.
                </p>
                <div className="bg-bgs-gray-light p-3 rounded-md text-sm mb-4">
                  <div><span className="font-medium">IBAN:</span> FR76 3000 4000 0300 0000 0000 000</div>
                  <div><span className="font-medium">BIC:</span> BNPAFRPP</div>
                  <div><span className="font-medium">Référence:</span> BGS-{userData.firstName.toUpperCase()}{userData.lastName.toUpperCase()}</div>
                </div>
                <button className="btn-primary w-full">J'ai effectué le virement</button>
              </div>
              
              <div className="border p-5 rounded-lg">
                <h3 className="font-medium text-bgs-blue mb-3">Demander un retrait</h3>
                <p className="text-sm text-bgs-gray-medium mb-4">
                  Vous pouvez demander un retrait de votre solde disponible vers votre compte bancaire. Les retraits sont traités sous 2 jours ouvrés.
                </p>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm text-bgs-gray-medium mb-1">Montant du retrait</label>
                    <input 
                      type="number" 
                      placeholder="0.00 €" 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-bgs-gray-medium mb-1">IBAN</label>
                    <input 
                      type="text" 
                      placeholder="FR76..." 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <button className="btn-primary w-full">Demander le retrait</button>
              </div>
            </div>
          </div>
        );
      default:
        return <Overview userData={userData} userInvestments={userInvestments} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-bgs-gray-light flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 pt-20">
        {/* Mobile sidebar toggle */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-md shadow-md"
          aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Sidebar */}
        <aside 
          className={cn(
            "bg-white shadow-md fixed md:static z-40 h-full transition-all",
            isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-20 md:translate-x-0"
          )}
        >
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isSidebarOpen={isSidebarOpen}
            handleLogout={handleLogout}
          />
        </aside>
        
        {/* Main content */}
        <main className={cn(
          "flex-1 p-6 transition-all",
          isSidebarOpen ? "md:ml-0" : "md:ml-0"
        )}>
          <div className="max-w-7xl mx-auto">
            <DashboardHeader userData={userData} />
            
            {/* Dashboard content based on active tab */}
            {renderTabContent()}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
