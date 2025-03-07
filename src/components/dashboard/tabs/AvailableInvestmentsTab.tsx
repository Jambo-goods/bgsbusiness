
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProjectsList from "@/components/projects/ProjectsList";
import { projects } from "@/data/projects";
import { Skeleton } from "@/components/ui/skeleton";

export default function AvailableInvestmentsTab() {
  const [projectFilter, setProjectFilter] = useState<"all" | "active" | "upcoming" | "completed">("all");
  
  // Filter projects based on selected filter
  const filteredProjects = projects.filter(project => 
    projectFilter === "all" ? true : project.status === projectFilter
  );

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-bgs-blue mb-6">Projets d'investissement disponibles</h2>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-gray-100">
            <TabsTrigger 
              value="all" 
              onClick={() => setProjectFilter("all")}
              className="data-[state=active]:bg-bgs-blue data-[state=active]:text-white"
            >
              Tous
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              onClick={() => setProjectFilter("active")}
              className="data-[state=active]:bg-bgs-blue data-[state=active]:text-white"
            >
              Actifs
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              onClick={() => setProjectFilter("upcoming")}
              className="data-[state=active]:bg-bgs-blue data-[state=active]:text-white"
            >
              À venir
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              onClick={() => setProjectFilter("completed")}
              className="data-[state=active]:bg-bgs-blue data-[state=active]:text-white"
            >
              Terminés
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0 animate-fade-up">
            <ProjectsList projects={filteredProjects} />
          </TabsContent>
          <TabsContent value="active" className="mt-0 animate-fade-up">
            <ProjectsList projects={filteredProjects} />
          </TabsContent>
          <TabsContent value="upcoming" className="mt-0 animate-fade-up">
            <ProjectsList projects={filteredProjects} />
          </TabsContent>
          <TabsContent value="completed" className="mt-0 animate-fade-up">
            <ProjectsList projects={filteredProjects} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
