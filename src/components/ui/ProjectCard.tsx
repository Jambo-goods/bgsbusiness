import { MapPin, Clock, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const statusLabel = {
    upcoming: "À venir",
    active: "En cours",
    completed: "Terminé",
  };

  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
  };

  return (
    <div 
      className="glass-card overflow-hidden transition-all hover:shadow-premium animate-fade-up"
      style={{ animationDelay: `${0.1 * index}s` }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
        />
        <div className="absolute top-4 right-4">
          <span className={cn("px-3 py-1 text-xs font-medium rounded-full", statusColors[project.status])}>
            {statusLabel[project.status]}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
        <p className="text-sm text-bgs-gray-medium mb-4">{project.companyName}</p>
        <p className="text-bgs-blue/80 mb-6 line-clamp-2">{project.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-bgs-orange" />
            <div>
              <p className="text-xs text-bgs-gray-medium">Rentabilité</p>
              <p className="font-semibold">{project.profitability}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-bgs-orange" />
            <div>
              <p className="text-xs text-bgs-gray-medium">Durée</p>
              <p className="font-semibold">{project.duration}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-6">
          <MapPin size={18} className="text-bgs-orange flex-shrink-0" />
          <p className="text-sm text-bgs-blue/80">{project.location}</p>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-bgs-gray-medium">Investissement minimum</p>
            <p className="font-semibold">{project.minInvestment.toLocaleString()} €</p>
          </div>
          <Link
            to={`/projects/${project.id}`}
            className="flex items-center gap-1 text-bgs-orange font-medium hover:text-bgs-orange-light transition-colors group"
          >
            Voir détails
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
