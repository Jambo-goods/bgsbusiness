
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, RefreshCw } from "lucide-react";

// Import les sections de paramètres nécessaires
import SecuritySection from "./settings/SecuritySection";
import NotificationsSection from "./settings/NotificationsSection";
import { UserSettings, defaultSettings } from "./settings/types";

export default function SettingsTab() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
        // Use default settings in case of error
        setSettings(defaultSettings);
      }
    }
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    console.log(`Thème appliqué: ${settings.theme}`);
  }, [settings.theme]);

  // Handle switch toggles for nested properties
  const handleSwitchChange = (key: string, subKey?: string) => {
    if (key === "notifications" && subKey) {
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [subKey]: !prev.notifications[subKey as keyof typeof prev.notifications]
        }
      }));
    } else if (key === "security" && subKey) {
      setSettings(prev => ({
        ...prev,
        security: {
          ...prev.security,
          [subKey]: !prev.security[subKey as keyof typeof prev.security]
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [key]: !prev[key as keyof typeof prev]
      }));
    }
  };

  // Password change handler
  const handlePasswordChange = async (currentPassword: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // This would be an API call in a real application
      setIsLoading(true);
      
      // Simulate network delay
      setTimeout(() => {
        setIsLoading(false);
        
        toast({
          title: "Mot de passe mis à jour",
          description: "Votre mot de passe a été modifié avec succès",
        });
        
        resolve();
      }, 1000);
    });
  };

  // Save all settings
  const handleSaveSettings = async () => {
    setIsLoading(true);

    try {
      // Save settings to localStorage
      localStorage.setItem("userSettings", JSON.stringify(settings));
      
      // Apply theme setting
      document.documentElement.classList.toggle("dark", settings.theme === "dark");
      
      toast({
        title: "Paramètres enregistrés",
        description: "Vos préférences ont été mises à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
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
          {/* Les sections langue et interface ont été supprimées */}
          
          {/* Security Section */}
          <SecuritySection 
            twoFactorEnabled={settings.security.twoFactorEnabled}
            onTwoFactorToggle={() => handleSwitchChange("security", "twoFactorEnabled")}
            onPasswordChange={handlePasswordChange}
            isLoading={isLoading}
          />

          <Separator />
          
          {/* Notifications Section */}
          <NotificationsSection 
            notifications={settings.notifications}
            onToggle={(key) => handleSwitchChange("notifications", key)}
          />
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
