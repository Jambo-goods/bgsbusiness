
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, LineChart, DollarSign, CheckCircle, Users, Clock, ShieldCheck, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/project";

interface ProjectSidebarProps {
  project: Project;
  remainingDays: number;
  investorCount: number;
}

export default function ProjectSidebar({ project, remainingDays, investorCount }: ProjectSidebarProps) {
  // Calculate funding progress percentage
  const progressPercentage = project.fundingProgress;
  
  return (
    <div className="glass-card p-6 sticky top-32 animate-fade-up" style={{ animationDelay: "0.2s" }}>
      {/* Status badge */}
      <div className="mb-5 flex justify-between items-center">
        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
          project.status === 'active' 
            ? 'bg-blue-100 text-blue-800' 
            : project.status === 'completed'
            ? 'bg-green-100 text-green-800'
            : 'bg-orange-100 text-orange-800'
        }`}>
          {project.status === 'active' 
            ? '● Projet actif' 
            : project.status === 'completed' 
            ? '● Projet complété' 
            : '● À venir'}
        </span>
        
        <div className="flex items-center text-sm font-medium text-green-600">
          <TrendingUp size={16} className="mr-1"/>
          {project.yield}% rendement
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-bgs-blue">Progression du financement</h3>
          <span className="text-sm font-medium text-bgs-blue">
            {progressPercentage}%
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          size="lg"
          showValue={false}
          className="mb-2"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-bgs-blue">
            <span className="font-medium">{Math.round(project.price * progressPercentage / 100).toLocaleString()} €</span> collectés
          </span>
          <span className="text-sm text-bgs-blue">
            Objectif: <span className="font-medium">{project.price.toLocaleString()} €</span>
          </span>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock size={18} className="text-bgs-orange mr-1" />
            <p className="text-2xl font-bold text-bgs-blue">{remainingDays}</p>
          </div>
          <p className="text-xs text-bgs-blue/70">jours restants</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center mb-1">
            <Users size={18} className="text-bgs-orange mr-1" />
            <p className="text-2xl font-bold text-bgs-blue">{investorCount}</p>
          </div>
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
          <div className="bg-green-50 p-2 rounded-full mr-3">
            <TrendingUp size={18} className="text-green-500" />
          </div>
          <div>
            <p className="text-sm text-bgs-blue/70">Rendement estimé</p>
            <p className="text-green-600 font-medium">{project.yield}% annuel</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-bgs-blue/5 p-2 rounded-full mr-3">
            <DollarSign size={18} className="text-bgs-blue" />
          </div>
          <div>
            <p className="text-sm text-bgs-blue/70">Investissement minimum</p>
            <p className="text-bgs-blue font-medium">{project.minInvestment.toLocaleString()} €</p>
          </div>
        </div>
      </div>
      
      {/* Countdown timer section */}
      <div className="mb-6 bg-bgs-orange/10 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <Clock size={18} className="text-bgs-orange mr-2" />
          <h4 className="font-medium text-bgs-blue">Offre à durée limitée</h4>
        </div>
        <p className="text-sm text-bgs-blue/80 mb-3">
          Investissez avant la fin de la campagne pour bénéficier des conditions actuelles.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[remainingDays, 23, 59, 48].map((value, index) => (
            <div key={index} className="bg-white rounded-md p-2 text-center">
              <div className="text-bgs-blue font-bold">{value}</div>
              <div className="text-xs text-bgs-blue/60">{["Jours", "Heures", "Min", "Sec"][index]}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Reassurance points */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center text-sm text-bgs-blue/80">
          <ShieldCheck size={16} className="text-green-500 mr-2 shrink-0" />
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
          className="w-full btn-primary justify-center mb-3 flex items-center"
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
