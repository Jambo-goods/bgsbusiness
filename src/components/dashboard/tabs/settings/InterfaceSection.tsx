
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PanelLeft } from "lucide-react";

interface InterfaceSectionProps {
  sidebarCollapsed: boolean;
  onToggle: () => void;
}

export default function InterfaceSection({ sidebarCollapsed, onToggle }: InterfaceSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <PanelLeft className="text-bgs-blue" size={20} />
        <h3 className="text-lg font-medium text-bgs-blue">Interface</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sidebar-collapsed" className="text-bgs-blue">Réduire la barre latérale par défaut</Label>
            <p className="text-sm text-bgs-gray-medium">La barre latérale sera réduite au démarrage</p>
          </div>
          <Switch 
            id="sidebar-collapsed" 
            checked={sidebarCollapsed}
            onCheckedChange={onToggle}
          />
        </div>
      </div>
    </div>
  );
}
