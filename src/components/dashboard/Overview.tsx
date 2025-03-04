
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/project";

interface OverviewProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    investmentTotal: number;
    projectsCount: number;
  };
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
}

export default function Overview({ userData, userInvestments, setActiveTab }: OverviewProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-bgs-blue/70 mb-2">
            Total investi
          </h3>
          <p className="text-3xl font-bold text-bgs-blue">
            {userData.investmentTotal.toLocaleString()} €
          </p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-bgs-blue/70 mb-2">
            Projets actifs
          </h3>
          <p className="text-3xl font-bold text-bgs-blue">
            {userData.projectsCount}
          </p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-bgs-blue/70 mb-2">
            Rendement moyen
          </h3>
          <p className="text-3xl font-bold text-green-500">
            13.5%
          </p>
        </div>
      </div>
      
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-bgs-blue mb-4">
          Mes investissements récents
        </h2>
        <div className="space-y-4">
          {userInvestments.map((project) => (
            <div key={project.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                <img 
                  src={project.image} 
                  alt={project.name} 
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-bgs-blue">{project.name}</h3>
                  <p className="text-sm text-bgs-blue/70">{project.location}</p>
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-bgs-blue/70">Progression</span>
                      <span className="text-xs font-medium text-bgs-blue">
                        {project.fundingProgress}%
                      </span>
                    </div>
                    <Progress value={project.fundingProgress} className="h-1.5" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-bgs-blue">2500 €</p>
                  <p className="text-sm text-green-500">+{project.yield}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button 
            onClick={() => setActiveTab("investments")}
            className="text-bgs-orange hover:text-bgs-orange-light transition-colors"
          >
            Voir tous mes investissements
          </button>
        </div>
      </div>
    </div>
  );
}
