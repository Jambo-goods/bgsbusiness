
import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ProfileTabProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
  };
  onProfileUpdate?: () => Promise<void>;
}

export default function ProfileTab({ userData, onProfileUpdate }: ProfileTabProps) {
  const [firstName, setFirstName] = useState(userData.firstName || "");
  const [lastName, setLastName] = useState(userData.lastName || "");
  const [email, setEmail] = useState(userData.email || "");
  const [phone, setPhone] = useState(userData.phone || "");
  const [address, setAddress] = useState(userData.address || "");
  const [isLoading, setIsLoading] = useState(false);
  const [displayPhone, setDisplayPhone] = useState(userData.phone || "");

  useEffect(() => {
    setFirstName(userData.firstName || "");
    setLastName(userData.lastName || "");
    setEmail(userData.email || "");
    setPhone(userData.phone || "");
    setAddress(userData.address || "");
    setDisplayPhone(userData.phone || "");
    
    // Add this debug log to verify the phone is coming through properly
    console.log("Phone number from userData:", userData.phone);
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }
      
      console.log("Mise à jour du profil avec le téléphone :", phone);
      
      // Debug log to verify that phone value is correct before update
      console.log("Données envoyées:", {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone, // Vérifie que cette valeur est correcte
        address: address
      });
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          address: address,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select(); // Return the updated data for verification
      
      if (error) {
        console.error("Erreur de mise à jour du profil:", error);
        throw error;
      }
      
      console.log("Profil mis à jour avec succès. Données retournées:", data);
      console.log("Téléphone enregistré:", data?.[0]?.phone);
      
      // Update the display phone value with the newly saved phone
      setDisplayPhone(data?.[0]?.phone || phone);
      
      if (onProfileUpdate) {
        await onProfileUpdate();
      }
      
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Une erreur est survenue lors de la mise à jour de votre profil");
    } finally {
      setIsLoading(false);
    }
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
              {/* Affichage permanent du numéro de téléphone actuel */}
              <div className="mt-2 p-2 bg-bgs-blue/5 rounded flex items-center">
                <Phone size={16} className="text-bgs-blue/60 mr-2" />
                <span className="text-sm font-medium text-bgs-blue/80">
                  {displayPhone || "Aucun numéro enregistré"}
                </span>
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
    </div>
  );
}
