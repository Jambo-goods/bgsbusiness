
import { Project } from "@/types/project";
import { Banknote, TrendingUpIcon, WalletIcon, BarChart3Icon } from "lucide-react";
import DashboardCard from "./DashboardCard";
import PortfolioChart from "./PortfolioChart";
import InvestmentDistribution from "./InvestmentDistribution";
import RecentProjects from "./RecentProjects";

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
}

export default function Overview({ userData, userInvestments, setActiveTab }: OverviewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solde disponible card */}
        <DashboardCard
          title="Solde disponible"
          value="3,250 €"
          icon={<Banknote />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          changePercentage="+8.3%"
          changeValue="↑ 250€"
          changeTimeframe="le dernier mois"
        />

        {/* Total investi card */}
        <DashboardCard
          title="Total investi"
          value={`${userData.investmentTotal.toLocaleString()} €`}
          icon={<WalletIcon />}
          iconBgColor="bg-blue-100"
          iconColor="text-bgs-blue"
          changePercentage="+12.5%"
          changeValue="↑ 1250€"
          changeTimeframe="le dernier mois"
        />

        {/* Projets actifs card */}
        <DashboardCard
          title="Projets actifs"
          value={userData.projectsCount}
          icon={<BarChart3Icon />}
          iconBgColor="bg-orange-100"
          iconColor="text-bgs-orange"
          changePercentage="+2"
          changeValue="↑ 2"
          changeTimeframe="le dernier trimestre"
        />

        {/* Rendement moyen card */}
        <DashboardCard
          title="Rendement moyen"
          value="13.5%"
          icon={<TrendingUpIcon />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          changePercentage="+1.2%"
          changeValue="↑ 1.2%"
          changeTimeframe="le dernier semestre"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PortfolioChart />
        <InvestmentDistribution setActiveTab={setActiveTab} />
      </div>
      
      <RecentProjects userInvestments={userInvestments} setActiveTab={setActiveTab} />
    </div>
  );
}
