
import { Link } from "react-router-dom";
import { CircleCheck, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Project {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  location: string;
  yield: number;
  fundingProgress: number;
  featured?: boolean;
}

interface ProjectsListProps {
  projects: Project[];
  featuredOnly?: boolean;
}

export default function ProjectsList({ projects, featuredOnly = false }: ProjectsListProps) {
  const filteredProjects = featuredOnly 
    ? projects.filter(project => project.featured)
    : projects;
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project) => (
        <Link to={`/projects/${project.id}`} key={project.id} className="glass-card overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="relative">
            <img 
              src={project.image} 
              alt={project.name}
              className="w-full h-48 object-cover"
            />
            {project.featured && (
              <div className="absolute top-3 right-3 bg-bgs-orange text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
                <Star size={12} className="mr-1" />
                Populaire
              </div>
            )}
          </div>
          
          <div className="p-5">
            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-bgs-orange/10 text-bgs-orange mb-2">
              {project.category}
            </span>
            <h3 className="text-lg font-semibold text-bgs-blue mb-1 line-clamp-1">
              {project.name}
            </h3>
            <p className="text-sm text-bgs-blue/70 mb-2">
              {project.location}
            </p>
            <p className="text-sm text-bgs-blue/80 mb-4 line-clamp-2">
              {project.description}
            </p>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-bgs-blue/70">Progression</span>
                <span className="text-xs font-medium text-bgs-blue">
                  {project.fundingProgress}%
                </span>
              </div>
              <Progress value={project.fundingProgress} className="h-1.5" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-bgs-blue/60">Prix</p>
                <p className="text-base font-semibold text-bgs-blue">
                  {project.price.toLocaleString()} €
                </p>
              </div>
              <div>
                <p className="text-xs text-bgs-blue/60">Rendement</p>
                <p className="text-base font-semibold text-bgs-blue flex items-center">
                  <CircleCheck size={14} className="text-green-500 mr-1" />
                  {project.yield}%
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
