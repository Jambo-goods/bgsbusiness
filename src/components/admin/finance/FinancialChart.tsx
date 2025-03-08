
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

type Transaction = {
  date: string;
  deposits: number;
  withdrawals: number;
};

export function FinancialChart() {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<Transaction[]>([]);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchTransactionData();
  }, [timeRange]);

  const fetchTransactionData = async () => {
    try {
      setIsLoading(true);
      
      // Get all transactions from the last X days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));
      
      const { data: transactions, error } = await supabase
        .from('wallet_transactions')
        .select('amount, type, created_at, status')
        .gte('created_at', startDate.toISOString())
        .eq('status', 'completed')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Process data for the chart
      const aggregatedData: Record<string, Transaction> = {};
      
      if (transactions) {
        transactions.forEach(tx => {
          // Format date as YYYY-MM-DD
          const date = new Date(tx.created_at).toISOString().split('T')[0];
          
          if (!aggregatedData[date]) {
            aggregatedData[date] = {
              date,
              deposits: 0,
              withdrawals: 0
            };
          }
          
          if (tx.type === 'deposit') {
            aggregatedData[date].deposits += tx.amount;
          } else if (tx.type === 'withdrawal') {
            aggregatedData[date].withdrawals += tx.amount;
          }
        });
      }
      
      // Convert to array and sort by date
      const chartData = Object.values(aggregatedData).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      setChartData(chartData);
      
    } catch (error) {
      console.error('Error fetching transaction data for chart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Dépôts et Retraits</h3>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded-md p-1.5 text-sm"
        >
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">3 derniers mois</option>
          <option value="365">12 derniers mois</option>
        </select>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-80">
          <Loader2 className="w-8 h-8 animate-spin text-bgs-blue" />
        </div>
      ) : chartData.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} €`, undefined]}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return d.toLocaleDateString();
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="deposits" 
                name="Dépôts" 
                stroke="#4CAF50" 
                fill="#4CAF50" 
                fillOpacity={0.3} 
              />
              <Area 
                type="monotone" 
                dataKey="withdrawals" 
                name="Retraits" 
                stroke="#FF9800" 
                fill="#FF9800" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex justify-center items-center h-80 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Aucune donnée disponible pour cette période</p>
        </div>
      )}
    </div>
  );
}
