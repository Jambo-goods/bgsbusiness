import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Briefcase, Settings, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { projects } from "@/data/projects";
import { Progress } from "@/components/ui/progress";
import Footer from "@/components/layout/Footer";

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

  return (
    <div className="min-h-screen bg-bgs-gray-light flex flex-col">
      <div className="flex flex-1">
        {/* Mobile sidebar toggle */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md"
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
          <div className="flex flex-col h-full py-6">
            <div className="flex justify-center mb-8">
              <Link to="/">
                <img 
                  src="lovable-uploads/d9a3204a-06aa-470d-8255-7f3bd0852557.png" 
                  alt="BGS Business Club" 
                  className="h-12 w-auto"
                />
              </Link>
            </div>
            
            <nav className="flex-1">
              <ul className="space-y-1 px-2">
                <li>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={cn(
                      "flex items-center w-full px-4 py-3 rounded-lg transition-colors",
                      activeTab === "overview" 
                        ? "bg-bgs-orange text-white" 
                        : "text-bgs-blue hover:bg-bgs-gray-light"
                    )}
                  >
                    <LayoutDashboard size={20} className={isSidebarOpen ? "mr-3" : "mx-auto"} />
                    {isSidebarOpen && <span>Aperçu</span>}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("investments")}
                    className={cn(
                      "flex items-center w-full px-4 py-3 rounded-lg transition-colors",
                      activeTab === "investments" 
                        ? "bg-bgs-orange text-white" 
                        : "text-bgs-blue hover:bg-bgs-gray-light"
                    )}
                  >
                    <Briefcase size={20} className={isSidebarOpen ? "mr-3" : "mx-auto"} />
                    {isSidebarOpen && <span>Mes investissements</span>}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={cn(
                      "flex items-center w-full px-4 py-3 rounded-lg transition-colors",
                      activeTab === "settings" 
                        ? "bg-bgs-orange text-white" 
                        : "text-bgs-blue hover:bg-bgs-gray-light"
                    )}
                  >
                    <Settings size={20} className={isSidebarOpen ? "mr-3" : "mx-auto"} />
                    {isSidebarOpen && <span>Paramètres</span>}
                  </button>
                </li>
              </ul>
            </nav>
            
            <div className="px-2 mt-auto">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} className={isSidebarOpen ? "mr-3" : "mx-auto"} />
                {isSidebarOpen && <span>Déconnexion</span>}
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className={cn(
          "flex-1 p-6 transition-all",
          isSidebarOpen ? "md:ml-0" : "md:ml-0"
        )}>
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-bgs-blue">
                Bonjour, {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-bgs-blue/70">
                Bienvenue sur votre tableau de bord BGS Business Club
              </p>
            </header>
            
            {/* Dashboard content based on active tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-medium text-bgs-blue/70 mb-2">
                      Total investi
                    </h3>
                    <p className="text-3xl font-bold text-bgs-blue">
                      {userData.investmentTotal.toLocaleString()} €
                    </p>
                  </div>
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-medium text-bgs-blue/70 mb-2">
                      Projets actifs
                    </h3>
                    <p className="text-3xl font-bold text-bgs-blue">
                      {userData.projectsCount}
                    </p>
                  </div>
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-medium text-bgs-blue/70 mb-2">
                      Rendement moyen
                    </h3>
                    <p className="text-3xl font-bold text-green-500">
                      13.5%
                    </p>
                  </div>
                </div>
                
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-bgs-blue mb-4">
                    Mes investissements récents
                  </h2>
                  <div className="space-y-4">
                    {userInvestments.map((project) => (
                      <div key={project.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <img 
                            src={project.image} 
                            alt={project.name} 
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-bgs-blue">{project.name}</h3>
                            <p className="text-sm text-bgs-blue/70">{project.location}</p>
                            <div className="mt-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-bgs-blue/70">Progression</span>
                                <span className="text-xs font-medium text-bgs-blue">
                                  {project.fundingProgress}%
                                </span>
                              </div>
                              <Progress value={project.fundingProgress} className="h-1.5" />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-bgs-blue">2500 €</p>
                            <p className="text-sm text-green-500">+{project.yield}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => setActiveTab("investments")}
                      className="text-bgs-orange hover:text-bgs-orange-light transition-colors"
                    >
                      Voir tous mes investissements
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "investments" && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-6">
                  Mes investissements
                </h2>
                
                <div className="space-y-6">
                  {userInvestments.map((project) => (
                    <div key={project.id} className="border bg-white rounded-lg overflow-hidden shadow-sm">
                      <div className="flex flex-col md:flex-row">
                        <img 
                          src={project.image} 
                          alt={project.name} 
                          className="w-full md:w-48 h-40 object-cover"
                        />
                        <div className="p-4 flex-1">
                          <h3 className="font-semibold text-bgs-blue mb-1">{project.name}</h3>
                          <p className="text-sm text-bgs-blue/70 mb-2">{project.location}</p>
                          <p className="text-sm text-bgs-blue/80 mb-4 line-clamp-2">
                            {project.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-bgs-blue/60">Montant investi</p>
                              <p className="font-semibold text-bgs-blue">2500 €</p>
                            </div>
                            <div>
                              <p className="text-xs text-bgs-blue/60">Rendement</p>
                              <p className="font-semibold text-green-500">{project.yield}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-bgs-blue/60">Date</p>
                              <p className="font-semibold text-bgs-blue">15/03/2023</p>
                            </div>
                            <div>
                              <p className="text-xs text-bgs-blue/60">Statut</p>
                              <p className="font-semibold text-bgs-blue capitalize">{project.status}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <Link 
                    to="/projects" 
                    className="btn-primary inline-block"
                  >
                    Découvrir de nouveaux projets
                  </Link>
                </div>
              </div>
            )}
            
            {activeTab === "settings" && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-6">
                  Paramètres du compte
                </h2>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-bgs-blue mb-1">
                        Prénom
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={userData.firstName}
                        onChange={() => {}}
                        className="bg-white border border-gray-200 text-bgs-blue rounded-lg block w-full p-2.5"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-bgs-blue mb-1">
                        Nom
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={userData.lastName}
                        onChange={() => {}}
                        className="bg-white border border-gray-200 text-bgs-blue rounded-lg block w-full p-2.5"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-bgs-blue mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={() => {}}
                      className="bg-white border border-gray-200 text-bgs-blue rounded-lg block w-full p-2.5"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-bgs-blue mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-white border border-gray-200 text-bgs-blue rounded-lg block w-full p-2.5"
                    />
                    <p className="mt-1 text-xs text-bgs-blue/70">
                      Laissez vide si vous ne souhaitez pas changer de mot de passe
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Enregistrer les modifications
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
