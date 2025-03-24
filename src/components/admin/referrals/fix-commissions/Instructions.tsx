
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const Instructions: React.FC = () => {
  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Fonctionnement</AlertTitle>
      <AlertDescription>
        Cette opération vérifie tous les paiements de rendement au statut "payé" et s'assure que les commissions 
        de parrainage (10%) ont été correctement créées. Pour chaque paiement sans commission, le système va :
        <ul className="list-disc ml-5 mt-2">
          <li>Vérifier si l'utilisateur a un parrain valide</li>
          <li>Calculer la commission (10% du rendement)</li>
          <li>Créer l'enregistrement dans la table referral_commissions</li>
          <li>Mettre à jour le solde du portefeuille du parrain</li>
          <li>Envoyer une notification au parrain</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default Instructions;
