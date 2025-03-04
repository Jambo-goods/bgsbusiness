
import { Project } from "@/types/project";

interface RecentProjectsProps {
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
}

export default function RecentProjects({ userInvestments, setActiveTab }: RecentProjectsProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-sm font-medium text-bgs-blue mb-4">
        Projets récents
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Projet</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Montant</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Rendement</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {userInvestments.map((project) => (
              <tr key={project.id} className="hover:bg-bgs-gray-light/50 transition-colors">
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <img 
                      src={project.image} 
                      alt={project.name} 
                      className="h-8 w-8 rounded-md object-cover mr-2"
                    />
                    <div>
                      <div className="font-medium text-bgs-blue text-xs">{project.name}</div>
                      <div className="text-xs text-bgs-gray-medium">{project.location}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-bgs-blue">15/03/2023</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-bgs-blue">2500 €</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                    {project.yield}%
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'active' 
                      ? 'bg-blue-100 text-blue-600' 
                      : project.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {project.status === 'active' ? 'Actif' : project.status === 'completed' ? 'Complété' : 'À venir'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100 text-center">
        <button 
          onClick={() => setActiveTab("investments")}
          className="text-bgs-orange hover:text-bgs-orange-light transition-colors text-xs font-medium"
        >
          Voir tous mes investissements
        </button>
      </div>
    </div>
  );
}
