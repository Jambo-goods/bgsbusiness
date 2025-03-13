
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle, Database } from "lucide-react";
import { toast } from "sonner";
import { loginAdmin } from "@/services/adminAuthService";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DatabaseLogin() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { adminUser, setAdminUser } = useAdmin();

  useEffect(() => {
    // Si déjà connecté, rediriger vers le tableau de bord
    if (adminUser) {
      navigate("/database/dashboard");
    }
  }, [adminUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Valider les entrées
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      toast.error("Veuillez remplir tous les champs");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Tentative de connexion admin avec:", email);
      const { success, error, admin } = await loginAdmin({ 
        email, 
        password 
      });
      
      if (!success || !admin) {
        const errorMessage = error || "Une erreur s'est produite lors de la connexion";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }
      
      toast.success("Connexion réussie");
      setAdminUser(admin);
      
      // Assurer la navigation vers le tableau de bord
      console.log("Navigation vers le tableau de bord...");
      navigate("/database/dashboard");
    } catch (err: any) {
      console.error("Erreur de connexion admin:", err);
      setError("Une erreur s'est produite lors de la connexion");
      toast.error("Une erreur s'est produite lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Database className="h-16 w-16 text-bgs-orange" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Base de Données Admin</h1>
          <p className="text-white/70">
            Accédez aux données du système
          </p>
        </div>
        
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 rounded-lg block w-full pl-10 p-2.5"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 rounded-lg block w-full pl-10 p-2.5"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-bgs-orange hover:bg-bgs-orange/90 text-white font-medium rounded-lg py-3 px-4 flex items-center justify-center gap-2"
            >
              {isLoading ? "Connexion en cours..." : (
                <>
                  Se connecter
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>Email: admin@example.com</p>
            <p>Mot de passe: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
