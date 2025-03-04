
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only update if there are changes
    if (
      formData.firstName !== user?.firstName ||
      formData.lastName !== user?.lastName ||
      formData.email !== user?.email ||
      formData.password
    ) {
      updateUser({
        ...user!,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        ...(formData.password ? { password: formData.password } : {})
      });
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    }
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold text-bgs-blue mb-6">
        Paramètres du compte
      </h2>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-bgs-blue mb-1">
              Prénom
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="bg-white border border-gray-200 text-bgs-blue rounded-lg block w-full p-2.5"
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-bgs-blue mb-1">
              Nom
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="bg-white border border-gray-200 text-bgs-blue rounded-lg block w-full p-2.5"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-bgs-blue mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="bg-white border border-gray-200 text-bgs-blue rounded-lg block w-full p-2.5"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-bgs-blue mb-1">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="bg-white border border-gray-200 text-bgs-blue rounded-lg block w-full p-2.5"
          />
          <p className="mt-1 text-xs text-bgs-blue/70">
            Laissez vide si vous ne souhaitez pas changer de mot de passe
          </p>
        </div>
        
        <button
          type="submit"
          className="btn-primary"
        >
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}
