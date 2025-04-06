
import React from "react";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Wallet, 
  LineChart, 
  BellRing, 
  Settings, 
  X, 
  LogOut, 
  User, 
  Users,
  Share2 
} from "lucide-react";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  handleLogout: () => void;
}

const sidebarLinks = [
  { id: "overview", label: "Tableau de bord", icon: BarChart3 },
  { id: "wallet", label: "Portefeuille", icon: Wallet },
  { id: "investments", label: "Mes investissements", icon: LineChart },
  { id: "referral", label: "Parrainage", icon: Share2 },
  { id: "notifications", label: "Notifications", icon: BellRing },
  { id: "profile", label: "Mon profil", icon: User },
  { id: "settings", label: "Paramètres", icon: Settings },
];

export default function DashboardSidebar({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  toggleSidebar,
  handleLogout
}: DashboardSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 bg-white border-r border-gray-200 pt-16 hidden md:flex md:flex-col w-64 transition-transform duration-200 ease-in-out z-10 shadow-sm",
          {
            "translate-x-0": isSidebarOpen,
            "-translate-x-full": !isSidebarOpen,
          }
        )}
      >
        <div className="flex-1 px-4 space-y-2 overflow-y-auto py-8">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={cn(
                  "flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors",
                  {
                    "bg-bgs-blue text-white": activeTab === link.id,
                    "text-bgs-blue hover:bg-bgs-blue/10": activeTab !== link.id,
                  }
                )}
              >
                <Icon
                  className={cn("h-5 w-5", {
                    "text-white": activeTab === link.id,
                    "text-bgs-blue": activeTab !== link.id,
                  })}
                />
                <span className="text-sm font-medium">{link.label}</span>
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Se déconnecter</span>
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 bg-white border-r border-gray-200 pt-16 flex flex-col w-64 md:hidden transition-transform duration-200 ease-in-out z-30 shadow-md",
          {
            "translate-x-0": isSidebarOpen,
            "-translate-x-full": !isSidebarOpen,
          }
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-bgs-blue">Menu</h2>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  toggleSidebar(); // Close sidebar on mobile after selecting
                }}
                className={cn(
                  "flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors",
                  {
                    "bg-bgs-blue text-white": activeTab === link.id,
                    "text-bgs-blue hover:bg-bgs-blue/10": activeTab !== link.id,
                  }
                )}
              >
                <Icon
                  className={cn("h-5 w-5", {
                    "text-white": activeTab === link.id,
                    "text-bgs-blue": activeTab !== link.id,
                  })}
                />
                <span className="text-sm font-medium">{link.label}</span>
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Se déconnecter</span>
          </button>
        </div>
      </div>

      {/* Overlay for closing mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
