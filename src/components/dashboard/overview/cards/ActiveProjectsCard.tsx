
import { BarChart3Icon } from "lucide-react";
import DashboardCard from "../../DashboardCard";
import { ProjectsChange } from "@/hooks/dashboard/types";

interface ActiveProjectsCardProps {
  projectsCount: number;
  projectsChange: ProjectsChange;
}

export default function ActiveProjectsCard({ projectsCount, projectsChange }: ActiveProjectsCardProps) {
  return (
    <DashboardCard
      title="Projets actifs"
      value={projectsCount}
      icon={<BarChart3Icon />}
      iconBgColor="bg-orange-100"
      iconColor="text-bgs-orange"
      changePercentage={projectsChange.value}
      changeValue={projectsChange.value}
      changeTimeframe="le dernier trimestre"
    />
  );
}
