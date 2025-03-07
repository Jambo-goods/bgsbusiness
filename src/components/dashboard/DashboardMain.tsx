
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import DashboardHeader from "./DashboardHeader";
import TabContent from "./TabContent";
import { Project } from "@/types/project";
import { Bell, Search, User } from "lucide-react";

interface DashboardMainProps {
  isSidebarOpen: boolean;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    investmentTotal: number;
    projectsCount: number;
    walletBalance?: number;
  };
  activeTab: string;
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
  refreshData?: () => Promise<void>;
}

export default function DashboardMain({ 
  isSidebarOpen, 
  userData, 
  activeTab, 
  userInvestments, 
  setActiveTab,
  refreshData
}: DashboardMainProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className={cn(
      "flex-1 transition-all",
      isSidebarOpen ? "md:ml-0" : "md:ml-0"
    )}>
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bgs-gray-medium h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 w-full bg-bgs-gray-light/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bgs-blue/30"
            />
          </div>

          <div className="flex items-center gap-4 ml-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-full hover:bg-bgs-gray-light transition-colors relative"
              >
                <Bell className="h-5 w-5 text-bgs-blue" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-bgs-orange rounded-full"></span>
              </button>
              
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-100 z-40 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-bgs-blue">Notifications</h3>
                    <span className="text-xs bg-bgs-orange/10 text-bgs-orange px-2 py-0.5 rounded-full">2 nouvelles</span>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    <div className="p-2 hover:bg-bgs-gray-light rounded-lg cursor-pointer">
                      <div className="flex gap-3 items-start">
                        <div className="bg-green-100 p-2 rounded-full shrink-0">
                          <div className="h-4 w-4 text-green-500 flex items-center justify-center">
                            ↑
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-bgs-blue">Rendement mis à jour</p>
                          <p className="text-xs text-bgs-gray-medium">Le rendement de BGS Wood Africa a augmenté à 15%</p>
                          <p className="text-xs text-bgs-gray-medium mt-1">Il y a 2 heures</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 hover:bg-bgs-gray-light rounded-lg cursor-pointer">
                      <div className="flex gap-3 items-start">
                        <div className="bg-blue-100 p-2 rounded-full shrink-0">
                          <div className="h-4 w-4 text-blue-500 flex items-center justify-center">
                            ↑
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-bgs-blue">Nouveau projet disponible</p>
                          <p className="text-xs text-bgs-gray-medium">BGS Energy est maintenant ouvert aux investissements</p>
                          <p className="text-xs text-bgs-gray-medium mt-1">Il y a 1 jour</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full text-center text-sm text-bgs-orange hover:text-bgs-orange-light mt-3">
                    Voir toutes les notifications
                  </button>
                </div>
              )}
            </div>
            
            <div className="h-9 w-9 rounded-full bg-bgs-blue text-white flex items-center justify-center font-medium">
              {userData.firstName ? userData.firstName.charAt(0) : ''}
              {userData.lastName ? userData.lastName.charAt(0) : ''}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6">
        <DashboardHeader userData={userData} />
        
        {/* Dashboard content based on active tab */}
        <TabContent 
          activeTab={activeTab} 
          userData={userData} 
          userInvestments={userInvestments} 
          setActiveTab={setActiveTab} 
          refreshData={refreshData}
        />
      </div>
    </main>
  );
}
