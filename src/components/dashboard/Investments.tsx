
import { Link } from "react-router-dom";
import { Project } from "@/types/project";

interface InvestmentsProps {
  userInvestments: Project[];
}

export default function Investments({ userInvestments }: InvestmentsProps) {
  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold text-bgs-blue mb-6">
        Mes investissements
      </h2>
      
      <div className="space-y-6">
        {userInvestments.map((project) => (
          <div key={project.id} className="border bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row">
              <img 
                src={project.image} 
                alt={project.name} 
                className="w-full md:w-48 h-40 object-cover"
              />
              <div className="p-4 flex-1">
                <h3 className="font-semibold text-bgs-blue mb-1">{project.name}</h3>
                <p className="text-sm text-bgs-blue/70 mb-2">{project.location}</p>
                <p className="text-sm text-bgs-blue/80 mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-bgs-blue/60">Montant investi</p>
                    <p className="font-semibold text-bgs-blue">2500 €</p>
                  </div>
                  <div>
                    <p className="text-xs text-bgs-blue/60">Rendement</p>
                    <p className="font-semibold text-green-500">{project.yield}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-bgs-blue/60">Date</p>
                    <p className="font-semibold text-bgs-blue">15/03/2023</p>
                  </div>
                  <div>
                    <p className="text-xs text-bgs-blue/60">Statut</p>
                    <p className="font-semibold text-bgs-blue capitalize">{project.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
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
