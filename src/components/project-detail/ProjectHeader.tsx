
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Share2, Download, Calendar, DollarSign, TrendingUp, Factory, MapPin } from "lucide-react";
import { Project } from "@/types/project";

interface ProjectHeaderProps {
  project: Project;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  // Calculate annual yield from monthly yield
  const annualYield = project.yield * 12;
  
  // Determine status display
  const statusConfig = {
    active: { bg: 'bg-blue-500', text: 'text-white', label: 'En cours' },
    completed: { bg: 'bg-green-500', text: 'text-white', label: 'Terminé' },
    upcoming: { bg: 'bg-orange-500', text: 'text-white', label: 'À venir' }
  };
  
  const status = statusConfig[project.status];
  
  return (
    <>
      {/* Navigation */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-bgs-blue/60 mb-6">
          <Link to="/" className="hover:text-bgs-orange transition-colors">Accueil</Link>
          <ChevronRight size={16} className="mx-1" />
          <Link to="/projects" className="hover:text-bgs-orange transition-colors">Projets</Link>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-bgs-blue">{project.name}</span>
        </div>
        <Link to="/projects" className="text-bgs-orange hover:text-bgs-orange-light inline-flex items-center">
          <ArrowLeft size={18} className="mr-2" />
          Retour aux projets
        </Link>
      </div>
      
      {/* Project Header */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-8 animate-fade-up">
        <div className="relative h-64 md:h-96">
          <img 
            src={project.image} 
            alt={project.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-bgs-orange text-white">
                {project.category}
              </span>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{project.name}</h1>
            <p className="text-white/80 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {project.location}
            </p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100">
          <div className="flex flex-wrap gap-8 justify-between items-center">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-bgs-gray-medium mb-1">Entreprise</p>
                <div className="flex items-center text-bgs-blue font-bold text-xl">
                  <Factory className="h-5 w-5 mr-2 text-bgs-blue/70" />
                  {project.companyName}
                </div>
              </div>
              
              <div className="h-12 w-0.5 bg-gray-200"></div>
              
              <div>
                <p className="text-sm text-bgs-gray-medium mb-1">Rentabilité estimée</p>
                <div className="flex items-center text-green-500 font-bold text-xl">
                  <TrendingUp className="h-5 w-5 mr-1" />
                  {project.profitability}%
                </div>
              </div>
              
              <div className="h-12 w-0.5 bg-gray-200"></div>
              
              <div>
                <p className="text-sm text-bgs-gray-medium mb-1">Rendement mensuel</p>
                <div className="flex items-center text-green-500 font-bold text-xl">
                  <TrendingUp className="h-5 w-5 mr-1" />
                  {project.yield}% <span className="text-sm font-medium ml-1">par mois</span>
                </div>
              </div>
              
              <div className="h-12 w-0.5 bg-gray-200 hidden md:block"></div>
              
              <div>
                <p className="text-sm text-bgs-gray-medium mb-1">Durée</p>
                <div className="flex items-center text-bgs-blue font-bold text-xl">
                  <Calendar className="h-5 w-5 mr-1 text-bgs-blue/70" />
                  {project.duration}
                </div>
              </div>
              
              <div className="h-12 w-0.5 bg-gray-200 hidden md:block"></div>
              
              <div className="hidden md:block">
                <p className="text-sm text-bgs-gray-medium mb-1">Investissement min.</p>
                <div className="flex items-center text-bgs-blue font-bold text-xl">
                  <DollarSign className="h-5 w-5 mr-1 text-bgs-blue/70" />
                  {project.minInvestment}€
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Partager">
                <Share2 className="h-5 w-5 text-bgs-blue/70" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Télécharger la présentation">
                <Download className="h-5 w-5 text-bgs-blue/70" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
