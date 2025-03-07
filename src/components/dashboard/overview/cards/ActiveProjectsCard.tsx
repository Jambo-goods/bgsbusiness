
import { BarChart3Icon } from "lucide-react";
import DashboardCard from "../../DashboardCard";
import { ProjectsChange } from "@/hooks/dashboard/types";

interface ActiveProjectsCardProps {
  projectsCount: number;
  projectsChange: ProjectsChange;
}

export default function ActiveProjectsCard({ 
  projectsCount = 0, 
  projectsChange 
}: ActiveProjectsCardProps) {
  return (
    <DashboardCard
      title="Projets actifs"
      value={projectsCount.toString()}
      icon={<BarChart3Icon />}
      iconBgColor="bg-orange-100"
      iconColor="text-bgs-orange"
      changePercentage={projectsChange.value || "0"}
      changeValue={projectsChange.value || "0"}
      changeTimeframe="le dernier trimestre"
    />
  );
}
