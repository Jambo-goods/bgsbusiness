
import { useState, useEffect } from "react";
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
  RefreshCw,
  Shield,
  Lock,
  FingerPrint
} from "lucide-react";
import PasswordFields from "@/components/auth/PasswordFields";

// Type définition pour les paramètres
type UserSettings = {
  language: string;
  theme: string;
  sidebarCollapsed: boolean;
  notifications: {
    email: boolean;
    app: boolean;
    marketing: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
  }
};

// Valeurs par défaut des paramètres
const defaultSettings: UserSettings = {
  language: "fr",
  theme: "light",
  sidebarCollapsed: false,
  notifications: {
    email: true,
    app: true,
    marketing: false
  },
  security: {
    twoFactorEnabled: false
  }
};

export default function SettingsTab() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Charger les paramètres depuis localStorage au chargement du composant
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
        // En cas d'erreur, utiliser les paramètres par défaut
        setSettings(defaultSettings);
      }
    }
  }, []);

  // Appliquer le thème au chargement et lorsqu'il change
  useEffect(() => {
    // Ici on pourrait implémenter la logique pour changer le thème de l'application
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    
    // On pourrait aussi ajuster d'autres éléments UI en fonction des préférences
    console.log(`Thème appliqué: ${settings.theme}`);
  }, [settings.theme]);

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

  const handlePasswordChange = () => {
    setPasswordError("");
    
    // Validation basique
    if (!currentPassword) {
      setPasswordError("Le mot de passe actuel est requis");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    // Simuler la mise à jour du mot de passe
    setIsLoading(true);
    
    // Simuler un délai de réseau (en production, ce serait un appel API)
    setTimeout(() => {
      setIsLoading(false);
      setShowPasswordChange(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès",
      });
    }, 1000);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);

    try {
      // Sauvegarder les paramètres dans localStorage
      localStorage.setItem("userSettings", JSON.stringify(settings));
      
      // Appliquer les paramètres immédiatement
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
                  onCheckedChange={() => handleSwitchChange("sidebarCollapsed")}
                />
              </div>
            </div>
          </div>

          <Separator />
          
          {/* Sécurité */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="text-bgs-blue" size={20} />
              <h3 className="text-lg font-medium text-bgs-blue">Sécurité</h3>
            </div>
            <div className="space-y-6">
              {/* Changement de mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label className="text-bgs-blue flex items-center gap-2">
                      <Lock size={16} />
                      Mot de passe
                    </Label>
                    <p className="text-sm text-bgs-gray-medium">Modifier votre mot de passe actuel</p>
                  </div>
                  {!showPasswordChange ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPasswordChange(true)}
                      className="border-bgs-blue text-bgs-blue hover:bg-bgs-blue hover:text-white"
                    >
                      Changer
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordError("");
                      }}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Annuler
                    </Button>
                  )}
                </div>
                
                {showPasswordChange && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    {passwordError && (
                      <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {passwordError}
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="current-password" className="text-bgs-blue mb-1 block">
                        Mot de passe actuel
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={18} className="text-bgs-blue/50" />
                        </div>
                        <input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                    
                    <PasswordFields
                      password={newPassword}
                      confirmPassword={confirmPassword}
                      setPassword={setNewPassword}
                      setConfirmPassword={setConfirmPassword}
                    />
                    
                    <Button 
                      onClick={handlePasswordChange}
                      disabled={isLoading}
                      className="w-full bg-bgs-blue hover:bg-bgs-blue-light text-white"
                    >
                      {isLoading ? "Traitement en cours..." : "Mettre à jour le mot de passe"}
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Authentification à deux facteurs */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="2fa-enabled" className="text-bgs-blue flex items-center gap-2">
                    <FingerPrint size={16} />
                    Authentification à deux facteurs
                  </Label>
                  <p className="text-sm text-bgs-gray-medium">Renforce la sécurité de votre compte</p>
                </div>
                <Switch 
                  id="2fa-enabled" 
                  checked={settings.security.twoFactorEnabled}
                  onCheckedChange={() => handleSwitchChange("security", "twoFactorEnabled")}
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
                  onCheckedChange={() => handleSwitchChange("notifications", "email")}
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
                  onCheckedChange={() => handleSwitchChange("notifications", "app")}
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
                  onCheckedChange={() => handleSwitchChange("notifications", "marketing")}
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
