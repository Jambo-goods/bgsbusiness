
import React from "react";
import { UsersIcon } from "lucide-react";

const EmptyReferralState: React.FC = () => {
  return (
    <div className="text-center p-6">
      <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Aucun filleul pour le moment</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Partagez votre lien de parrainage avec vos amis et recevez 10% de commission sur leurs rendements.
      </p>
    </div>
  );
};

export default EmptyReferralState;
