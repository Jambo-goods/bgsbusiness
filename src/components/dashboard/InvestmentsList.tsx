
import { Link } from "react-router-dom";
import { Project } from "@/types/project";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, TrendingUp, AlertCircle } from "lucide-react";

interface InvestmentsListProps {
  userInvestments: Project[];
}

export default function InvestmentsList({ userInvestments }: InvestmentsListProps) {
  // Format date to French locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get status badge color based on project status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-0.5 text-xs rounded-full bg-green-100 text-green-800">Actif</span>;
      case 'upcoming':
        return <span className="px-2.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">À venir</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">Terminé</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-bgs-blue">
          Mes investissements
        </h2>
        <span className="text-sm text-bgs-blue/70">
          {userInvestments.length} projets
        </span>
      </div>
      
      {userInvestments.length > 0 ? (
        <div className="space-y-6">
          {userInvestments.map((project) => (
            <div key={project.id} className="border bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-48">
                  <img 
                    src={project.image} 
                    alt={project.name} 
                    className="w-full md:w-48 h-40 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(project.status)}
                  </div>
                </div>
                <div className="p-4 flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                    <div>
                      <Link to={`/projects/${project.id}`} className="font-semibold text-bgs-blue hover:text-bgs-orange transition-colors">
                        {project.name}
                      </Link>
                      <p className="text-sm text-bgs-blue/70 mb-2">{project.location}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <CalendarIcon size={14} className="text-bgs-blue/60" />
                      <span className="text-bgs-blue/70">Investi le 15/03/2023</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-bgs-blue/80 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-bgs-blue/60">Montant investi</p>
                      <p className="font-semibold text-bgs-blue">2500 €</p>
                    </div>
                    <div>
                      <p className="text-xs text-bgs-blue/60">Rendement</p>
                      <p className="font-semibold text-green-500 flex items-center">
                        <TrendingUp size={14} className="mr-1" />
                        {project.yield}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-bgs-blue/60">Date</p>
                      <p className="font-semibold text-bgs-blue">15/03/2023</p>
                    </div>
                    <div>
                      <p className="text-xs text-bgs-blue/60">Progression</p>
                      <div className="mt-1">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-bgs-blue/70">{project.fundingProgress}%</span>
                        </div>
                        <Progress value={project.fundingProgress} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-bgs-blue/40 mb-4" />
          <h3 className="text-lg font-medium text-bgs-blue mb-2">Aucun investissement</h3>
          <p className="text-bgs-blue/70 mb-6">
            Vous n'avez pas encore d'investissements actifs. Découvrez nos projets disponibles.
          </p>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link 
          to="/projects" 
          className="btn-primary inline-block"
        >
          Découvrir de nouveaux projets
        </Link>
      </div>
    </div>
  );
}
