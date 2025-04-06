
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OverviewTabProps {
  userData: any;
  userInvestments: any[];
  setActiveTab: (tab: string) => void;
}

export default function OverviewTab({ userData, userInvestments, setActiveTab }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="font-medium text-gray-500">Solde du portefeuille</h3>
          <p className="text-2xl font-bold mt-2">{userData?.wallet_balance || 0} €</p>
          <Button 
            onClick={() => setActiveTab('wallet')} 
            variant="link" 
            className="p-0 h-auto mt-2 text-sm"
          >
            Gérer mon portefeuille →
          </Button>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium text-gray-500">Investissements actifs</h3>
          <p className="text-2xl font-bold mt-2">{userInvestments?.length || 0}</p>
          <Button 
            onClick={() => setActiveTab('investments')} 
            variant="link" 
            className="p-0 h-auto mt-2 text-sm"
          >
            Voir mes investissements →
          </Button>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium text-gray-500">Total investi</h3>
          <p className="text-2xl font-bold mt-2">{userData?.investment_total || 0} €</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium text-gray-500">Programme parrainage</h3>
          <p className="text-2xl font-bold mt-2">+25 €</p>
          <Button 
            onClick={() => setActiveTab('referral')} 
            variant="link" 
            className="p-0 h-auto mt-2 text-sm"
          >
            Inviter des amis →
          </Button>
        </Card>
      </div>
    </div>
  );
}
