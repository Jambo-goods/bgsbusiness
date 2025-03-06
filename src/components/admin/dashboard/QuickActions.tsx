
import React from 'react';
import { Users, Database, CreditCard, ArrowLeftRight } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button 
        onClick={() => window.location.href = '/admin/users'}
        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
      >
        <Users className="h-8 w-8 mx-auto mb-2 text-bgs-blue" />
        <span className="font-medium text-bgs-blue">Gérer les utilisateurs</span>
      </button>
      
      <button 
        onClick={() => window.location.href = '/admin/projects'}
        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
      >
        <Database className="h-8 w-8 mx-auto mb-2 text-purple-600" />
        <span className="font-medium text-bgs-blue">Gérer les projets</span>
      </button>
      
      <button 
        onClick={() => window.location.href = '/admin/wallets'}
        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
      >
        <CreditCard className="h-8 w-8 mx-auto mb-2 text-green-600" />
        <span className="font-medium text-bgs-blue">Gérer les portefeuilles</span>
      </button>
      
      <button 
        onClick={() => window.location.href = '/admin/withdrawals'}
        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
      >
        <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 text-red-600" />
        <span className="font-medium text-bgs-blue">Gérer les retraits</span>
      </button>
    </div>
  );
}
