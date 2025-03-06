
import { Project } from "@/types/project";
import DashboardCards from "./overview/DashboardCards";
import ChartsSection from "./overview/ChartsSection";
import RecentProjects from "./RecentProjects";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface OverviewProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    investmentTotal: number;
    projectsCount: number;
    walletBalance?: number;
  };
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
}

export default function Overview({ userData, userInvestments, setActiveTab }: OverviewProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Check local storage for recent investment
  useEffect(() => {
    const recentInvestment = localStorage.getItem("recentInvestment");
    if (recentInvestment) {
      // Parse the stored investment data
      const investmentData = JSON.parse(recentInvestment);
      
      // Show success toast
      toast({
        title: "Investissement réussi !",
        description: `Votre investissement de ${investmentData.amount}€ dans ${investmentData.projectName} a été enregistré.`,
      });
      
      // Remove from local storage to prevent showing again on refresh
      localStorage.removeItem("recentInvestment");
      
      // Set state to indicate new investment
      setShowSuccess(true);
    }
  }, []);

  return (
    <div className="space-y-4">
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4 animate-fade-in">
          <p className="font-medium">Nouvel investissement ajouté avec succès!</p>
          <p className="text-sm">Vous pouvez voir les détails dans la section Investissements.</p>
        </div>
      )}
      <DashboardCards userData={userData} />
      <ChartsSection setActiveTab={setActiveTab} />
      <RecentProjects userInvestments={userInvestments} setActiveTab={setActiveTab} />
    </div>
  );
}
