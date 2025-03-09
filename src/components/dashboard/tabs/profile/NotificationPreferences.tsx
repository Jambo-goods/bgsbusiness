
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface NotificationSetting {
  email: boolean;
  sms: boolean;
  app: boolean;
  marketing: boolean;
}

interface NotificationPreferencesProps {
  initialSettings: NotificationSetting;
}

export function NotificationPreferences({ initialSettings }: NotificationPreferencesProps) {
  const [notifications, setNotifications] = useState(initialSettings);

  const handleNotificationChange = (key: keyof NotificationSetting) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-bgs-blue mb-4">Préférences de notification</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications" className="text-bgs-blue">Notifications par email</Label>
            <p className="text-sm text-bgs-gray-medium">Recevoir des mises à jour sur vos investissements par email</p>
          </div>
          <Switch 
            id="email-notifications" 
            checked={notifications.email}
            onCheckedChange={() => handleNotificationChange('email')}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sms-notifications" className="text-bgs-blue">Notifications par SMS</Label>
            <p className="text-sm text-bgs-gray-medium">Recevoir des alertes importantes par SMS</p>
          </div>
          <Switch 
            id="sms-notifications" 
            checked={notifications.sms}
            onCheckedChange={() => handleNotificationChange('sms')}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="app-notifications" className="text-bgs-blue">Notifications dans l'application</Label>
            <p className="text-sm text-bgs-gray-medium">Voir les notifications dans le tableau de bord</p>
          </div>
          <Switch 
            id="app-notifications" 
            checked={notifications.app}
            onCheckedChange={() => handleNotificationChange('app')}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing-notifications" className="text-bgs-blue">Emails marketing</Label>
            <p className="text-sm text-bgs-gray-medium">Recevoir des informations sur les nouveaux projets et opportunités</p>
          </div>
          <Switch 
            id="marketing-notifications" 
            checked={notifications.marketing}
            onCheckedChange={() => handleNotificationChange('marketing')}
          />
        </div>
      </div>
    </div>
  );
}
