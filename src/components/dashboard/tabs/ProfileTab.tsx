import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Save, RefreshCw, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ProfileTabProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
  };
}

export default function ProfileTab({ userData }: ProfileTabProps) {
  const [firstName, setFirstName] = useState(userData.firstName || "");
  const [lastName, setLastName] = useState(userData.lastName || "");
  const [email, setEmail] = useState(userData.email || "");
  const [phone, setPhone] = useState(userData.phone || "");
  const [address, setAddress] = useState(userData.address || "");
  const [isLoading, setIsLoading] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(70);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    app: true,
    marketing: false
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans une application réelle, nous enverrions ces données à un backend
      const updatedUserData = {
        firstName,
        lastName,
        email,
        phone,
        address
      };
      
      console.log("Mise à jour du profil:", updatedUserData);
      
      // Mettre à jour les données utilisateur dans localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const newUserData = { ...parsedUser, ...updatedUserData };
        localStorage.setItem("user", JSON.stringify(newUserData));
      }
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de votre profil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-bgs-blue mb-4">Informations personnelles</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-bgs-blue mb-1">
                Prénom
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-bgs-blue/50" />
                </div>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-white border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-bgs-blue mb-1">
                Nom
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-bgs-blue/50" />
                </div>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-white border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-bgs-blue mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-bgs-blue/50" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-bgs-blue mb-1">
                Téléphone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-bgs-blue/50" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-bgs-blue mb-1">
                Adresse
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-bgs-blue/50" />
                </div>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-white border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
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
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-bgs-blue mb-4">Sécurité</h2>
        
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
        </div>
      </div>
      
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
    </div>
  );
}
