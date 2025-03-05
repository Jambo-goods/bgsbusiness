
import { Project } from "@/types/project";
import DashboardCards from "./overview/DashboardCards";
import ChartsSection from "./overview/ChartsSection";
import RecentProjects from "./RecentProjects";
import { useRecentInvestment } from "@/hooks/use-recent-investment";

interface OverviewProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    investmentTotal: number;
    projectsCount: number;
  };
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
  refreshData: () => void;
}

export default function Overview({ userData, userInvestments, setActiveTab, refreshData }: OverviewProps) {
  const { showSuccess, recentInvestment } = useRecentInvestment(refreshData);

  return (
    <div className="space-y-4">
      {showSuccess && recentInvestment && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4 animate-fade-in">
          <p className="font-medium">Nouvel investissement ajouté avec succès!</p>
          <p className="text-sm">Vous avez investi {recentInvestment.amount}€ dans {recentInvestment.projectName}. Vous pouvez voir les détails dans la section Investissements.</p>
        </div>
      )}
      <DashboardCards userData={userData} />
      <ChartsSection setActiveTab={setActiveTab} />
      <RecentProjects userInvestments={userInvestments} setActiveTab={setActiveTab} />
    </div>
  );
}
