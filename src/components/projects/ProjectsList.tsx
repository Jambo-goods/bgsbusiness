
import { useState, useEffect, useCallback } from "react";
import { Project } from "@/types/project";
import ProjectCard from "@/components/projects/ProjectCard";

interface ProjectsListProps {
  projects: Project[];
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  const [visibleProjects, setVisibleProjects] = useState(6);
  
  // Optimize load more function with debounce
  const loadMore = useCallback(() => {
    setVisibleProjects(prev => prev + 6);
  }, []);
  
  // Preload images for visible projects
  useEffect(() => {
    const preloadImages = () => {
      const projectsToPreload = projects.slice(0, visibleProjects);
      projectsToPreload.forEach(project => {
        if (project.image) {
          const img = new Image();
          img.src = project.image;
        }
      });
    };
    
    preloadImages();
  }, [projects, visibleProjects]);
  
  if (projects.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Aucun projet disponible.</p>
      </div>
    );
  }
  
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
