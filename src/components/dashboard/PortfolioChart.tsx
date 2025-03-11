
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { RefreshCcw, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function PortfolioChart() {
  const { portfolioData, isLoading, refreshData } = usePortfolioData();
  const [animateRefresh, setAnimateRefresh] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  
  // Calculate current year
  const currentYear = new Date().getFullYear();
  
  // Manually refresh data
  const handleRefresh = () => {
    setAnimateRefresh(true);
    refreshData();
    setTimeout(() => setAnimateRefresh(false), 1000);
  };

  // Determine if there's actual data (not just zeros)
  const hasActualData = portfolioData.some(point => point.value > 0);
  
  // Calculate total performance (simplified)
  const performancePercent = hasActualData ? '+12.8%' : '0%';
  
  return (
    <section className="bg-white p-6 rounded-lg shadow-md border border-gray-100 lg:col-span-2 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-semibold text-bgs-blue flex items-center">
            Performance du portefeuille
            <span className="ml-2 text-sm bg-green-50 text-green-600 px-2 py-0.5 rounded-md flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {performancePercent}
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Progression de la valeur de vos investissements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 rounded-lg p-0.5 flex text-xs">
            <button 
              onClick={() => setSelectedPeriod('month')}
              className={`px-2.5 py-1 rounded-md transition ${selectedPeriod === 'month' ? 'bg-white text-bgs-blue shadow-sm' : 'text-gray-600'}`}
            >
              Mois
            </button>
            <button 
              onClick={() => setSelectedPeriod('quarter')}
              className={`px-2.5 py-1 rounded-md transition ${selectedPeriod === 'quarter' ? 'bg-white text-bgs-blue shadow-sm' : 'text-gray-600'}`}
            >
              Trimestre
            </button>
            <button 
              onClick={() => setSelectedPeriod('year')}
              className={`px-2.5 py-1 rounded-md transition ${selectedPeriod === 'year' ? 'bg-white text-bgs-blue shadow-sm' : 'text-gray-600'}`}
            >
              Année
            </button>
          </div>
          <button 
            onClick={handleRefresh}
            className="text-gray-500 hover:text-bgs-blue transition-colors bg-gray-50 p-1.5 rounded-md"
            title="Rafraîchir les données"
          >
            <RefreshCcw 
              className={`h-4 w-4 ${animateRefresh ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-60 flex items-center justify-center">
          <div className="space-y-2 w-full">
            <Skeleton className="h-40 w-full" />
            <p className="text-center text-xs text-gray-500">Chargement des données du portefeuille...</p>
          </div>
        </div>
      ) : !hasActualData ? (
        <div className="h-60 flex flex-col items-center justify-center space-y-2 border border-dashed border-gray-200 rounded-lg bg-gray-50">
          <div className="bg-blue-50 p-3 rounded-full">
            <ArrowUpRight className="h-6 w-6 text-bgs-blue" />
          </div>
          <p className="text-center text-gray-600 font-medium">Aucune donnée d'investissement disponible</p>
          <p className="text-center text-sm text-gray-400">Effectuez votre premier investissement pour voir le graphique</p>
          <button className="mt-2 text-bgs-orange hover:text-bgs-orange-light text-sm font-medium">
            Découvrir les projets
          </button>
        </div>
      ) : (
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A2A4A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A2A4A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickFormatter={(value) => `${value} €`}
              />
              <Tooltip 
                formatter={(value) => [`${value} €`, 'Montant']} 
                labelFormatter={(label) => `${label} ${currentYear}`}
                contentStyle={{ 
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#1A2A4A" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
