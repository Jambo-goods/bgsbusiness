
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
      {/* Related info */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
        <h3 className="text-lg font-semibold text-bgs-blue mb-4">En savoir plus</h3>
        <div className="space-y-3">
          <a href="#" className="flex items-center justify-between py-2 border-b border-gray-100 text-bgs-blue hover:text-bgs-orange transition-colors">
            <span>Qui peut investir ?</span>
            <ChevronRight className="h-4 w-4" />
          </a>
          <a href="#" className="flex items-center justify-between py-2 border-b border-gray-100 text-bgs-blue hover:text-bgs-orange transition-colors">
            <span>Comment fonctionne le rendement ?</span>
            <ChevronRight className="h-4 w-4" />
          </a>
          <a href="#" className="flex items-center justify-between py-2 border-b border-gray-100 text-bgs-blue hover:text-bgs-orange transition-colors">
            <span>Sécurité de l'investissement</span>
            <ChevronRight className="h-4 w-4" />
          </a>
          <a href="#" className="flex items-center justify-between py-2 text-bgs-blue hover:text-bgs-orange transition-colors">
            <span>Fiscalité applicable</span>
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
