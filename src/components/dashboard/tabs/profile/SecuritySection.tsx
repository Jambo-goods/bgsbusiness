
import { Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SecuritySectionProps {
  securityLevel: number;
}

export function SecuritySection({ securityLevel }: SecuritySectionProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-bgs-blue mb-4">Sécurité</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-bgs-blue">Niveau de sécurité</span>
          <span className="text-sm text-bgs-blue">{securityLevel}%</span>
        </div>
        <Progress value={securityLevel} className="h-2" />
      </div>
      
      <div className="space-y-4">
        <button 
          type="button" 
          className="w-full text-left px-4 py-3 bg-bgs-gray-light rounded-lg hover:bg-bgs-gray-light/80 transition-colors flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-bgs-blue" />
            <span className="font-medium text-bgs-blue">Modifier le mot de passe</span>
          </div>
          <span className="text-bgs-gray-medium">&gt;</span>
        </button>
        
        <button 
          type="button" 
          className="w-full text-left px-4 py-3 bg-bgs-gray-light rounded-lg hover:bg-bgs-gray-light/80 transition-colors flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-bgs-blue" />
            <span className="font-medium text-bgs-blue">Authentification à deux facteurs</span>
          </div>
          <span className="text-bgs-gray-medium">&gt;</span>
        </button>
      </div>
    </div>
  );
}
