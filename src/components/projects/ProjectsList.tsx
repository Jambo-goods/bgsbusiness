
import { useState } from "react";
import { Project } from "@/types/project";
import ProjectCard from "@/components/projects/ProjectCard";

interface ProjectsListProps {
  projects: Project[];
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  const [visibleProjects, setVisibleProjects] = useState(6);
  
  const loadMore = () => {
    setVisibleProjects(prev => prev + 6);
  };
  
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.slice(0, visibleProjects).map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
      
      {visibleProjects < projects.length && (
        <div className="text-center pt-8">
          <button 
            onClick={loadMore}
            className="btn-secondary"
          >
            Voir plus de projets
          </button>
        </div>
      )}
    </div>
  );
}
