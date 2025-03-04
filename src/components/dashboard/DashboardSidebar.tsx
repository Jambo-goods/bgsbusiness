
import { Link } from "react-router-dom";
import { LayoutDashboard, Wallet, Settings, Menu, LogOut, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
}

export default function DashboardSidebar({
  activeTab,
  setActiveTab,
  isSidebarOpen
}: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  
  const navItems = [
    {
      name: "Tableau de bord",
      icon: <LayoutDashboard size={20} />,
      tab: "overview"
    },
    {
      name: "Investissements",
      icon: <Wallet size={20} />,
      tab: "investments"
    },
    {
      name: "Transactions",
      icon: <History size={20} />,
      tab: "transactions"
    },
    {
      name: "Paramètres",
      icon: <Settings size={20} />,
      tab: "settings"
    }
  ];
  
  return (
    <div className="h-full flex flex-col">
      {/* Logo & header */}
      <div className="p-6 border-b">
        <Link to="/" className="flex items-center">
          <span className={cn(
            "font-bold text-bgs-blue transition-opacity",
            isSidebarOpen ? "opacity-100" : "opacity-0"
          )}>
            BGS Business Club
          </span>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.tab}>
              <button
                onClick={() => setActiveTab(item.tab)}
                className={cn(
                  "w-full flex items-center py-2 px-6 text-bgs-blue/70 hover:bg-bgs-blue/5 transition-colors",
                  activeTab === item.tab && "bg-bgs-blue/5 text-bgs-blue font-medium"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                <span className={cn(
                  "transition-all",
                  isSidebarOpen ? "opacity-100" : "opacity-0 w-0"
                )}>
                  {item.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User info & logout */}
      <div className="p-6 border-t">
        <div className={cn(
          "flex items-center mb-4 transition-opacity",
          isSidebarOpen ? "opacity-100" : "opacity-0"
        )}>
          <div className="w-8 h-8 rounded-full bg-bgs-blue/20 flex items-center justify-center text-bgs-blue mr-3">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-bgs-blue line-clamp-1">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-bgs-blue/60 line-clamp-1">
              {user?.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center py-2 px-2 text-red-500 hover:bg-red-50 rounded transition-colors"
        >
          <LogOut size={18} className="mr-3" />
          <span className={cn(
            "transition-all",
            isSidebarOpen ? "opacity-100" : "opacity-0 w-0"
          )}>
            Déconnexion
          </span>
        </button>
      </div>
    </div>
  );
}
