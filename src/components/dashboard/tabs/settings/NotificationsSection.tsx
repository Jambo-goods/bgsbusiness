
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";

interface NotificationSectionProps {
  notifications: {
    email: boolean;
    app: boolean;
    marketing: boolean;
  };
  onToggle: (key: string) => void;
}

export default function NotificationsSection({ notifications, onToggle }: NotificationSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="text-bgs-blue" size={20} />
        <h3 className="text-lg font-medium text-bgs-blue">Notifications</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications" className="text-bgs-blue">Notifications par email</Label>
            <p className="text-sm text-bgs-gray-medium">Recevoir des mises à jour sur vos investissements par email</p>
          </div>
          <Switch 
            id="email-notifications" 
            checked={notifications.email}
            onCheckedChange={() => onToggle("email")}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="app-notifications" className="text-bgs-blue">Notifications dans l'application</Label>
            <p className="text-sm text-bgs-gray-medium">Voir les notifications dans le tableau de bord</p>
          </div>
          <Switch 
            id="app-notifications" 
            checked={notifications.app}
            onCheckedChange={() => onToggle("app")}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing-notifications" className="text-bgs-blue">Emails marketing</Label>
            <p className="text-sm text-bgs-gray-medium">Recevoir des informations sur les nouveaux projets et opportunités</p>
          </div>
          <Switch 
            id="marketing-notifications" 
            checked={notifications.marketing}
            onCheckedChange={() => onToggle("marketing")}
          />
        </div>
      </div>
    </div>
  );
}
