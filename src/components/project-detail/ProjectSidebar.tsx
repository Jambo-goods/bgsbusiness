import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Clock, ChevronRight } from "lucide-react";
import { Project } from "@/types/project";
import { Progress } from "@/components/ui/progress";

interface ProjectSidebarProps {
  project: Project;
  remainingDays: number;
  investorCount: number;
}

export default function ProjectSidebar({ project, remainingDays, investorCount }: ProjectSidebarProps) {
  return (
    <div className="sticky top-32">
      {/* Empty sidebar */}
    </div>
  );
}
