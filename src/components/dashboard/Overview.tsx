
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/project";
import { ArrowUpIcon, TrendingUpIcon, WalletIcon, BarChart3Icon, ChevronRightIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 1500 },
  { name: 'Fév', value: 1800 },
  { name: 'Mar', value: 2000 },
  { name: 'Avr', value: 2400 },
  { name: 'Mai', value: 2200 },
  { name: 'Juin', value: 2800 },
  { name: 'Juil', value: 3000 },
  { name: 'Août', value: 3300 },
  { name: 'Sep', value: 3500 },
  { name: 'Oct', value: 3800 },
  { name: 'Nov', value: 4100 },
  { name: 'Déc', value: 4500 },
];

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <WalletIcon className="h-6 w-6 text-bgs-blue" />
            </div>
            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium flex items-center">
              <ArrowUpIcon className="h-3 w-3 mr-1" /> +12.5%
            </span>
          </div>
          <h3 className="text-sm font-medium text-bgs-gray-medium mb-1">
            Total investi
          </h3>
          <p className="text-2xl font-bold text-bgs-blue">
            {userData.investmentTotal.toLocaleString()} €
          </p>
          <div className="mt-3 text-xs text-bgs-gray-medium">
            <span className="text-green-500">↑ 1250€</span> depuis le dernier mois
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <BarChart3Icon className="h-6 w-6 text-bgs-orange" />
            </div>
            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium flex items-center">
              <ArrowUpIcon className="h-3 w-3 mr-1" /> +2
            </span>
          </div>
          <h3 className="text-sm font-medium text-bgs-gray-medium mb-1">
            Projets actifs
          </h3>
          <p className="text-2xl font-bold text-bgs-blue">
            {userData.projectsCount}
          </p>
          <div className="mt-3 text-xs text-bgs-gray-medium">
            <span className="text-green-500">↑ 2</span> depuis le dernier trimestre
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium flex items-center">
              <ArrowUpIcon className="h-3 w-3 mr-1" /> +1.2%
            </span>
          </div>
          <h3 className="text-sm font-medium text-bgs-gray-medium mb-1">
            Rendement moyen
          </h3>
          <p className="text-2xl font-bold text-green-600">
            13.5%
          </p>
          <div className="mt-3 text-xs text-bgs-gray-medium">
            <span className="text-green-500">↑ 1.2%</span> depuis le dernier semestre
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-bgs-blue">
              Performance du portefeuille
            </h2>
            <div className="bg-bgs-gray-light text-bgs-blue text-xs px-3 py-1 rounded-lg">
              Année 2023
            </div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E67E22" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#E67E22" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`${value} €`, 'Montant']} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#E67E22" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-bgs-blue">
              Répartition
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-bgs-gray-medium">BGS Wood Africa</span>
                <span className="font-medium text-bgs-blue">2500 €</span>
              </div>
              <Progress value={33} className="h-1.5 bg-gray-100" indicatorClassName="bg-bgs-orange" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-bgs-gray-medium">BGS Energy</span>
                <span className="font-medium text-bgs-blue">2000 €</span>
              </div>
              <Progress value={27} className="h-1.5 bg-gray-100" indicatorClassName="bg-blue-500" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-bgs-gray-medium">BGS Logistics</span>
                <span className="font-medium text-bgs-blue">3000 €</span>
              </div>
              <Progress value={40} className="h-1.5 bg-gray-100" indicatorClassName="bg-green-500" />
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <button 
              onClick={() => setActiveTab("investments")}
              className="flex items-center justify-between w-full text-bgs-orange hover:text-bgs-orange-light transition-colors text-sm font-medium"
            >
              <span>Voir tous mes investissements</span>
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50">
        <h2 className="text-lg font-semibold text-bgs-blue mb-6">
          Projets récents
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Projet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Rendement</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userInvestments.map((project) => (
                <tr key={project.id} className="hover:bg-bgs-gray-light/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={project.image} 
                        alt={project.name} 
                        className="h-10 w-10 rounded-lg object-cover mr-3"
                      />
                      <div>
                        <div className="font-medium text-bgs-blue">{project.name}</div>
                        <div className="text-xs text-bgs-gray-medium">{project.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-bgs-blue">15/03/2023</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-bgs-blue">2500 €</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                      {project.yield}%
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
        
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <button 
            onClick={() => setActiveTab("investments")}
            className="text-bgs-orange hover:text-bgs-orange-light transition-colors text-sm font-medium"
          >
            Voir tous mes investissements
          </button>
        </div>
      </div>
    </div>
  );
}
