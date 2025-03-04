
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, LineChart, DollarSign, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/project";

interface ProjectSidebarProps {
  project: Project;
  remainingDays: number;
  investorCount: number;
}

export default function ProjectSidebar({ project, remainingDays, investorCount }: ProjectSidebarProps) {
  return (
    <div className="glass-card p-6 sticky top-32 animate-fade-up" style={{ animationDelay: "0.2s" }}>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-bgs-blue">Progression du financement</h3>
          <span className="text-sm font-medium text-bgs-blue">
            {project.fundingProgress}%
          </span>
        </div>
        <Progress 
          value={project.fundingProgress} 
          size="lg"
          showValue={true}
          className="mb-2"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-bgs-blue">
            <span className="font-medium">{Math.round(project.price * project.fundingProgress / 100).toLocaleString()} €</span> collectés
          </span>
          <span className="text-sm text-bgs-blue">
            Objectif: <span className="font-medium">{project.price.toLocaleString()} €</span>
          </span>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-bgs-blue">{remainingDays}</p>
          <p className="text-xs text-bgs-blue/70">jours restants</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-bgs-blue">{investorCount}</p>
          <p className="text-xs text-bgs-blue/70">investisseurs</p>
        </div>
      </div>
      
      {/* Investment details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start">
          <div className="bg-bgs-blue/5 p-2 rounded-full mr-3">
            <Calendar size={18} className="text-bgs-blue" />
          </div>
          <div>
            <p className="text-sm text-bgs-blue/70">Durée du projet</p>
            <p className="text-bgs-blue font-medium">{project.duration}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-bgs-blue/5 p-2 rounded-full mr-3">
            <LineChart size={18} className="text-bgs-blue" />
          </div>
          <div>
            <p className="text-sm text-bgs-blue/70">Rendement estimé</p>
            <p className="text-bgs-blue font-medium">{project.yield}% annuel</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-bgs-blue/5 p-2 rounded-full mr-3">
            <DollarSign size={18} className="text-bgs-blue" />
          </div>
          <div>
            <p className="text-sm text-bgs-blue/70">Investissement minimum</p>
            <p className="text-bgs-blue font-medium">{project.minInvestment} €</p>
          </div>
        </div>
      </div>
      
      {/* Reassurance points */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center text-sm text-bgs-blue/80">
          <CheckCircle size={16} className="text-green-500 mr-2 shrink-0" />
          <span>Contrat d'investissement sécurisé</span>
        </div>
        <div className="flex items-center text-sm text-bgs-blue/80">
          <CheckCircle size={16} className="text-green-500 mr-2 shrink-0" />
          <span>Paiements mensuels réguliers</span>
        </div>
        <div className="flex items-center text-sm text-bgs-blue/80">
          <CheckCircle size={16} className="text-green-500 mr-2 shrink-0" />
          <span>Support dédié aux investisseurs</span>
        </div>
      </div>
      
      {/* CTA */}
      <div>
        <Link 
          to="/login" 
          className="w-full btn-primary justify-center mb-3"
        >
          Investir maintenant
        </Link>
        
        <button 
          className="w-full justify-center mb-6 py-3 px-4 border border-bgs-blue/20 rounded-lg text-bgs-blue font-medium hover:bg-bgs-blue/5 transition-colors flex items-center"
        >
          Contacter l'équipe projet
        </button>
        
        <p className="text-xs text-center text-bgs-blue/60">
          En investissant, vous acceptez les <Link to="/conditions-dutilisation" className="text-bgs-orange hover:underline">conditions générales</Link> et reconnaissez avoir lu notre <Link to="/politique-de-confidentialite" className="text-bgs-orange hover:underline">politique de confidentialité</Link>.
        </p>
      </div>
    </div>
  );
}
