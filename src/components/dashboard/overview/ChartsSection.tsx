
import InvestmentDistribution from "../InvestmentDistribution";

interface ChartsSectionProps {
  setActiveTab: (tab: string) => void;
}

export default function ChartsSection({ setActiveTab }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <InvestmentDistribution setActiveTab={setActiveTab} />
    </div>
  );
}
