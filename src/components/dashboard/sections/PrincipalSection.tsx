
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Wallet, 
  BarChart3, 
  FileText, 
  Settings, 
  Users, 
  History 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrincipalSection() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-2">
      <Button 
        variant="ghost" 
        className="w-full justify-start" 
        onClick={() => navigate('/dashboard/wallet')}
      >
        {/* Correctly render the icon component */}
        <Wallet className="mr-2 h-4 w-4" />
        <span>Portefeuille</span>
      </Button>
      
      <Button 
        variant="ghost" 
        className="w-full justify-start" 
        onClick={() => navigate('/dashboard/investments')}
      >
        {/* Correctly render the icon component */}
        <BarChart3 className="mr-2 h-4 w-4" />
        <span>Investissements</span>
      </Button>
      
      <Button 
        variant="ghost" 
        className="w-full justify-start" 
        onClick={() => navigate('/dashboard/documents')}
      >
        {/* Correctly render the icon component */}
        <FileText className="mr-2 h-4 w-4" />
        <span>Documents</span>
      </Button>
      
      <Button 
        variant="ghost" 
        className="w-full justify-start" 
        onClick={() => navigate('/dashboard/history')}
      >
        {/* Correctly render the icon component */}
        <History className="mr-2 h-4 w-4" />
        <span>Historique</span>
      </Button>
      
      <Button 
        variant="ghost" 
        className="w-full justify-start" 
        onClick={() => navigate('/dashboard/referrals')}
      >
        {/* Correctly render the icon component */}
        <Users className="mr-2 h-4 w-4" />
        <span>Parrainage</span>
      </Button>
      
      <Button 
        variant="ghost" 
        className="w-full justify-start" 
        onClick={() => navigate('/dashboard/settings')}
      >
        {/* Correctly render the icon component */}
        <Settings className="mr-2 h-4 w-4" />
        <span>Paramètres</span>
      </Button>
    </div>
  );
}
