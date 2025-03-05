
import { Banknote, TrendingUpIcon, WalletIcon, BarChart3Icon } from "lucide-react";
import DashboardCard from "../DashboardCard";

interface DashboardCardsProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    investmentTotal: number;
    projectsCount: number;
  };
}

export default function DashboardCards({ userData }: DashboardCardsProps) {
  // Calculate yearly yield for display
  const monthlyYield = 1.125; // 1.125% per month
  const annualYield = monthlyYield * 12; // 13.5% per year
  
  return (
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
        title="Rendement mensuel moyen"
        value={`${monthlyYield}%`}
        icon={<TrendingUpIcon />}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        changePercentage="+0.1%"
        changeValue="↑ 0.1%"
        changeTimeframe="le dernier mois"
        description={`${annualYield}% annualisé`}
      />
    </div>
  );
}
