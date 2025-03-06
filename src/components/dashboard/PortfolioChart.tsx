
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { Skeleton } from '@/components/ui/skeleton';

export default function PortfolioChart() {
  const { portfolioData, isLoading } = usePortfolioData();
  
  // Calculate current year
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium text-bgs-blue">
          Performance du portefeuille
        </h2>
        <div className="bg-bgs-gray-light text-bgs-blue text-xs px-2 py-0.5 rounded-md">
          Année {currentYear}
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-60 flex items-center justify-center">
          <Skeleton className="h-40 w-full" />
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
