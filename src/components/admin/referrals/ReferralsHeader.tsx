
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, Settings, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FixReferralCommissions from './FixReferralCommissions';

interface ReferralsHeaderProps {
  refreshData: () => void;
}

export default function ReferralsHeader({ refreshData }: ReferralsHeaderProps) {
  const [isFixDialogOpen, setIsFixDialogOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Parrainages</h1>
        <p className="text-muted-foreground">
          Gérez tous les parrainages d'utilisateurs et leurs commissions
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={refreshData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
        
        <Button variant="default" onClick={() => setIsFixDialogOpen(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Corriger Commissions
        </Button>
      </div>
      
      <Dialog open={isFixDialogOpen} onOpenChange={setIsFixDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Correction des commissions de parrainage</DialogTitle>
            <DialogDescription>
              Cet outil va retroactivement créer des commissions pour les paiements qui n'en ont pas généré.
            </DialogDescription>
          </DialogHeader>
          
          <FixReferralCommissions />
        </DialogContent>
      </Dialog>
    </div>
  );
}
