
import React from "react";
import { Link } from "react-router-dom";
import { Project } from "@/types/project";
import { ArrowRight, Clock, MapPin, TrendingUp, Building, Calendar } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  // Définir les couleurs et le texte en fonction du statut
  const statusConfig = {
    active: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'En cours' },
    completed: { bg: 'bg-green-100', text: 'text-green-600', label: 'Terminé' },
    upcoming: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'À venir' }
  };
  
  const status = statusConfig[project.status];
  // Calculate annual yield for display
  const annualYield = project.yield * 12;
  
  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-fade-up border border-gray-50"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative overflow-hidden group">
        <img 
          src={project.image} 
          alt={project.name} 
          className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-0 right-0 p-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-bgs-blue">{project.name}</h3>
          <span className="flex items-center text-green-500 font-semibold">
            <TrendingUp className="h-4 w-4 mr-1" />
            {project.yield}% mensuel
          </span>
        </div>
        
        <div className="flex items-center text-bgs-gray-medium text-sm mb-2">
          <Building className="h-4 w-4 mr-1" />
          {project.companyName}
        </div>
        
        <div className="flex items-center text-bgs-gray-medium text-sm mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          {project.location}
          <span className="mx-2">•</span>
          <Calendar className="h-4 w-4 mr-1" />
          {project.duration}
        </div>
        
        <p className="text-bgs-blue/80 mb-4 line-clamp-2">
          {project.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-bgs-gray-light p-3 rounded-lg">
            <p className="text-xs text-bgs-gray-medium mb-1">Rentabilité annualisée</p>
            <p className="font-semibold text-green-600">{annualYield.toFixed(2)}%</p>
          </div>
          <div className="bg-bgs-gray-light p-3 rounded-lg">
            <p className="text-xs text-bgs-gray-medium mb-1">Min. investissement</p>
            <p className="font-semibold text-bgs-blue">{project.minInvestment}€</p>
          </div>
        </div>
        
        <Link
          to={`/project/${project.id}`}
          className="flex items-center justify-center w-full bg-bgs-blue text-white py-3 rounded-lg hover:bg-bgs-blue-light transition-colors font-medium mt-6"
        >
          Voir le projet
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
