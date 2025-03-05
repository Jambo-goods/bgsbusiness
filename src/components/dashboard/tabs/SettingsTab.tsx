
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Globe, 
  Sun, 
  Moon, 
  PanelLeft, 
  Languages, 
  Save, 
  RefreshCw 
} from "lucide-react";

export default function SettingsTab() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    language: "fr",
    theme: "light",
    sidebarCollapsed: false,
    notifications: {
      email: true,
      app: true,
      marketing: false
    }
  });

  const handleSwitchChange = (key: string, subKey?: string) => {
    if (subKey) {
      setSettings(prev => ({
        ...prev,
        [key]: {
          ...prev[key as keyof typeof prev],
          [subKey]: !(prev[key as keyof typeof prev] as Record<string, boolean>)[subKey]
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [key]: !prev[key as keyof typeof prev]
      }));
    }
  };

  const handleLanguageChange = (language: string) => {
    setSettings(prev => ({
      ...prev,
      language
    }));
  };

  const handleThemeChange = (theme: string) => {
    setSettings(prev => ({
      ...prev,
      theme
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);

    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Dans une application réelle, nous sauvegarderions les paramètres dans une base de données
      localStorage.setItem("userSettings", JSON.stringify(settings));
      
      toast({
        title: "Paramètres enregistrés",
        description: "Vos préférences ont été mises à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde des paramètres",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-bgs-blue mb-4">Paramètres</h2>
        
        <div className="space-y-8">
          {/* Langue */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="text-bgs-blue" size={20} />
              <h3 className="text-lg font-medium text-bgs-blue">Langue</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant={settings.language === "fr" ? "default" : "outline"}
                className={settings.language === "fr" ? "bg-bgs-blue text-white" : ""}
                onClick={() => handleLanguageChange("fr")}
              >
                <Languages className="mr-2 h-4 w-4" />
                Français
              </Button>
              <Button 
                variant={settings.language === "en" ? "default" : "outline"}
                className={settings.language === "en" ? "bg-bgs-blue text-white" : ""}
                onClick={() => handleLanguageChange("en")}
              >
                <Languages className="mr-2 h-4 w-4" />
                English
              </Button>
              <Button 
                variant={settings.language === "es" ? "default" : "outline"}
                className={settings.language === "es" ? "bg-bgs-blue text-white" : ""}
                onClick={() => handleLanguageChange("es")}
              >
                <Languages className="mr-2 h-4 w-4" />
                Español
              </Button>
            </div>
          </div>

          <Separator />
          
          {/* Thème */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="text-bgs-blue" size={20} />
              <h3 className="text-lg font-medium text-bgs-blue">Thème</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant={settings.theme === "light" ? "default" : "outline"}
                className={settings.theme === "light" ? "bg-bgs-blue text-white" : ""}
                onClick={() => handleThemeChange("light")}
              >
                <Sun className="mr-2 h-4 w-4" />
                Clair
              </Button>
              <Button 
                variant={settings.theme === "dark" ? "default" : "outline"}
                className={settings.theme === "dark" ? "bg-bgs-blue text-white" : ""}
                onClick={() => handleThemeChange("dark")}
              >
                <Moon className="mr-2 h-4 w-4" />
                Sombre
              </Button>
              <Button 
                variant={settings.theme === "system" ? "default" : "outline"}
                className={settings.theme === "system" ? "bg-bgs-blue text-white" : ""}
                onClick={() => handleThemeChange("system")}
              >
                <div className="mr-2 relative w-4 h-4">
                  <Sun className="absolute h-4 w-4 opacity-50" />
                  <Moon className="absolute h-4 w-4 opacity-50" />
                </div>
                Système
              </Button>
            </div>
          </div>

          <Separator />
          
          {/* Interface */}
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
                  checked={settings.sidebarCollapsed}
                  onCheckedChange={() => handleSwitchChange('sidebarCollapsed')}
                />
              </div>
            </div>
          </div>

          <Separator />
          
          {/* Notifications */}
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
                  checked={settings.notifications.email}
                  onCheckedChange={() => handleSwitchChange('notifications', 'email')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="app-notifications" className="text-bgs-blue">Notifications dans l'application</Label>
                  <p className="text-sm text-bgs-gray-medium">Voir les notifications dans le tableau de bord</p>
                </div>
                <Switch 
                  id="app-notifications" 
                  checked={settings.notifications.app}
                  onCheckedChange={() => handleSwitchChange('notifications', 'app')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-notifications" className="text-bgs-blue">Emails marketing</Label>
                  <p className="text-sm text-bgs-gray-medium">Recevoir des informations sur les nouveaux projets et opportunités</p>
                </div>
                <Switch 
                  id="marketing-notifications" 
                  checked={settings.notifications.marketing}
                  onCheckedChange={() => handleSwitchChange('notifications', 'marketing')}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSaveSettings} 
            disabled={isLoading}
            className="bg-bgs-blue hover:bg-bgs-blue-light text-white flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={16} />
                Enregistrer les paramètres
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
