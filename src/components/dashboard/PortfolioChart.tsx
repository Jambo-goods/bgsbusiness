
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';

export default function PortfolioChart() {
  const { portfolioData, isLoading, refreshData } = usePortfolioData();
  const [animateRefresh, setAnimateRefresh] = useState(false);
  
  // Calculate current year
  const currentYear = new Date().getFullYear();
  
  // Manually refresh data
  const handleRefresh = () => {
    setAnimateRefresh(true);
    refreshData();
    setTimeout(() => setAnimateRefresh(false), 1000);
  };
  
  // Log when portfolio data changes for debugging
  useEffect(() => {
    console.log("Portfolio chart data updated:", portfolioData);
  }, [portfolioData]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium text-bgs-blue">
          Performance du portefeuille
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className="text-gray-500 hover:text-bgs-blue transition-colors"
            title="Rafraîchir les données"
          >
            <RefreshCcw 
              className={`h-4 w-4 ${animateRefresh ? 'animate-spin' : ''}`} 
            />
          </button>
          <div className="bg-bgs-gray-light text-bgs-blue text-xs px-2 py-0.5 rounded-md">
            Année {currentYear}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-60 flex items-center justify-center">
          <div className="space-y-2 w-full">
            <Skeleton className="h-40 w-full" />
            <p className="text-center text-xs text-gray-500">Chargement des données du portefeuille...</p>
          </div>
        </div>
      ) : portfolioData.length === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center space-y-2">
          <p className="text-center text-gray-500">Aucune donnée d'investissement disponible</p>
          <p className="text-center text-sm text-gray-400">Effectuez votre premier investissement pour voir le graphique</p>
        </div>
      ) : (
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E67E22" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#E67E22" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                formatter={(value) => [`${value} €`, 'Montant']} 
                labelFormatter={(label) => `${label} ${currentYear}`}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#E67E22" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
