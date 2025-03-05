import React from "react";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/project";
import { Users, Target } from "lucide-react";
interface FundingProgressProps {
  project: Project;
  investorCount: number;
}
export default function FundingProgress({
  project,
  investorCount
}: FundingProgressProps) {
  const raised = project.raised || project.price * (project.fundingProgress / 100);
  const target = project.target || project.price;
  const progressPercentage = raised / target * 100;
  return;
}