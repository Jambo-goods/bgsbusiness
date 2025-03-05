
import PortfolioChart from "../PortfolioChart";
import InvestmentDistribution from "../InvestmentDistribution";

interface ChartsSectionProps {
  setActiveTab: (tab: string) => void;
}

export default function ChartsSection({ setActiveTab }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <PortfolioChart />
      <InvestmentDistribution setActiveTab={setActiveTab} />
    </div>
  );
}
