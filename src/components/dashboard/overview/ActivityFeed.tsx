
import React from 'react';
import { CalendarIcon, TrendingUp, ArrowUpRight, BarChart, CreditCard, AlertCircle } from 'lucide-react';

type Activity = {
  id: string;
  type: 'investment' | 'yield' | 'deposit' | 'withdrawal' | 'notification';
  title: string;
  description: string;
  date: string;
  amount?: number;
  status?: string;
};

export default function ActivityFeed() {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'investment',
      title: 'Nouvel investissement',
      description: 'Investissement dans BGS Wood Africa',
      date: '15 Sept 2023',
      amount: 2500,
      status: 'Confirmé'
    },
    {
      id: '2',
      type: 'yield',
      title: 'Rendement reçu',
      description: 'Rendement mensuel de BGS Energy',
      date: '10 Sept 2023',
      amount: 125,
      status: 'Versé'
    },
    {
      id: '3',
      type: 'deposit',
      title: 'Dépôt sur le compte',
      description: 'Via carte bancaire',
      date: '5 Sept 2023',
      amount: 1000,
      status: 'Terminé'
    },
    {
      id: '4',
      type: 'notification',
      title: 'Mise à jour du rendement',
      description: 'Le rendement de BGS Logistics a augmenté à 15%',
      date: '1 Sept 2023'
    },
    {
      id: '5',
      type: 'withdrawal',
      title: 'Retrait vers compte bancaire',
      description: 'Vers Société Générale ****2546',
      date: '25 Août 2023',
      amount: 500,
      status: 'Terminé'
    }
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'investment': return <BarChart className="h-5 w-5 text-blue-600" />;
      case 'yield': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'deposit': return <ArrowUpRight className="h-5 w-5 text-purple-600" />;
      case 'withdrawal': return <CreditCard className="h-5 w-5 text-orange-600" />;
      case 'notification': return <AlertCircle className="h-5 w-5 text-amber-600" />;
      default: return <CalendarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBgColorByType = (type: Activity['type']) => {
    switch (type) {
      case 'investment': return 'bg-blue-100';
      case 'yield': return 'bg-green-100';
      case 'deposit': return 'bg-purple-100';
      case 'withdrawal': return 'bg-orange-100';
      case 'notification': return 'bg-amber-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <h2 className="text-sm font-medium text-bgs-blue mb-4">Activité récente</h2>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${getBgColorByType(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div>
                  <h3 className="text-sm font-medium text-bgs-blue">{activity.title}</h3>
                  <p className="text-xs text-bgs-gray-medium">{activity.description}</p>
                </div>
                
                {activity.amount !== undefined && (
                  <span className={`text-sm font-medium mt-1 sm:mt-0 ${
                    activity.type === 'yield' || activity.type === 'deposit' 
                      ? 'text-green-600' 
                      : activity.type === 'withdrawal' 
                        ? 'text-orange-600'
                        : 'text-bgs-blue'
                  }`}>
                    {activity.type === 'withdrawal' ? '-' : '+'}{activity.amount} €
                  </span>
                )}
              </div>
              
              <div className="flex justify-between mt-1">
                <span className="text-xs text-bgs-gray-medium">{activity.date}</span>
                {activity.status && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-bgs-blue">
                    {activity.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
        <button className="text-bgs-orange hover:text-bgs-orange-light transition-colors text-xs font-medium">
          Voir toute l'activité
        </button>
      </div>
    </div>
  );
}
