
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, CreditCard, BellRing, Languages } from "lucide-react";

interface SettingsProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function Settings({ userData }: SettingsProps) {
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: "",
    confirmPassword: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Modifications enregistrées",
      description: "Vos paramètres ont été mis à jour avec succès.",
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-base font-medium text-bgs-blue mb-4">
          Paramètres du compte
        </h2>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4 bg-bgs-gray-light p-1 rounded-lg">
            <TabsTrigger value="profile" className="flex items-center gap-1.5 data-[state=active]:bg-white text-sm text-bgs-blue">
              <User className="h-3.5 w-3.5" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1.5 data-[state=active]:bg-white text-sm text-bgs-blue">
              <Shield className="h-3.5 w-3.5" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1.5 data-[state=active]:bg-white text-sm text-bgs-blue">
              <BellRing className="h-3.5 w-3.5" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-1.5 data-[state=active]:bg-white text-sm text-bgs-blue">
              <CreditCard className="h-3.5 w-3.5" />
              Paiement
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-medium text-bgs-blue mb-1">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="bg-white border border-gray-200 text-bgs-blue text-sm rounded-lg block w-full p-2 focus:ring-1 focus:ring-bgs-orange focus:border-bgs-orange"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-xs font-medium text-bgs-blue mb-1">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="bg-white border border-gray-200 text-bgs-blue text-sm rounded-lg block w-full p-2 focus:ring-1 focus:ring-bgs-orange focus:border-bgs-orange"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-bgs-blue mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white border border-gray-200 text-bgs-blue text-sm rounded-lg block w-full p-2 focus:ring-1 focus:ring-bgs-orange focus:border-bgs-orange"
                />
              </div>
              
              <div>
                <label htmlFor="language" className="block text-xs font-medium text-bgs-blue mb-1">
                  Langue
                </label>
                <div className="relative">
                  <select
                    id="language"
                    className="bg-white border border-gray-200 text-bgs-blue text-sm rounded-lg block w-full p-2 appearance-none focus:ring-1 focus:ring-bgs-orange focus:border-bgs-orange"
                    defaultValue="fr"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                  <Languages className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-bgs-gray-medium pointer-events-none" />
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-bgs-blue text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-bgs-blue/90 transition-colors"
              >
                Enregistrer les modifications
              </button>
            </form>
          </TabsContent>
          
          <TabsContent value="security">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-xs font-medium text-bgs-blue mb-1">
                  Mot de passe actuel
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white border border-gray-200 text-bgs-blue text-sm rounded-lg block w-full p-2 focus:ring-1 focus:ring-bgs-orange focus:border-bgs-orange"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-bgs-blue mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-white border border-gray-200 text-bgs-blue text-sm rounded-lg block w-full p-2 focus:ring-1 focus:ring-bgs-orange focus:border-bgs-orange"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-bgs-blue mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-white border border-gray-200 text-bgs-blue text-sm rounded-lg block w-full p-2 focus:ring-1 focus:ring-bgs-orange focus:border-bgs-orange"
                />
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <Shield className="h-4 w-4 text-bgs-blue mr-2" />
                <p className="text-xs text-bgs-blue">Pour une sécurité optimale, utilisez un mot de passe fort avec des lettres, chiffres et symboles.</p>
              </div>
              
              <button
                type="submit"
                className="bg-bgs-blue text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-bgs-blue/90 transition-colors"
              >
                Mettre à jour le mot de passe
              </button>
            </form>
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-1.5 rounded-lg mr-3">
                    <BellRing className="h-4 w-4 text-bgs-blue" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-bgs-blue">Notifications par email</h3>
                    <p className="text-xs text-bgs-gray-medium">Recevoir des emails sur les nouvelles opportunités</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-bgs-orange/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bgs-orange"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-1.5 rounded-lg mr-3">
                    <BellRing className="h-4 w-4 text-bgs-blue" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-bgs-blue">Mises à jour des projets</h3>
                    <p className="text-xs text-bgs-gray-medium">Recevoir des notifications sur l'avancement des projets</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-bgs-orange/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bgs-orange"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-1.5 rounded-lg mr-3">
                    <BellRing className="h-4 w-4 text-bgs-blue" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-bgs-blue">Newsletters mensuelles</h3>
                    <p className="text-xs text-bgs-gray-medium">Recevoir un résumé mensuel des activités</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-bgs-orange/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bgs-orange"></div>
                </label>
              </div>
              
              <button
                onClick={() => toast({
                  title: "Paramètres enregistrés",
                  description: "Vos préférences de notification ont été mises à jour.",
                })}
                className="bg-bgs-blue text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-bgs-blue/90 transition-colors w-full mt-3"
              >
                Enregistrer les préférences
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="payment">
            <div className="text-center py-6">
              <CreditCard className="h-12 w-12 mx-auto text-bgs-gray-medium mb-2" />
              <h3 className="text-sm font-medium text-bgs-blue mb-1">Aucune méthode de paiement</h3>
              <p className="text-xs text-bgs-gray-medium mb-4">Ajoutez une méthode de paiement pour investir rapidement dans de nouveaux projets</p>
              <button className="bg-bgs-blue text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-bgs-blue/90 transition-colors">
                Ajouter une méthode de paiement
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
