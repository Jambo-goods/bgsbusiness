
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

export default function PortfolioChart() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium text-bgs-blue">
          Performance du portefeuille
        </h2>
        <div className="bg-bgs-gray-light text-bgs-blue text-xs px-2 py-0.5 rounded-md">
          Année 2023
        </div>
      </div>
      
      <div className="h-60">
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
  );
}
