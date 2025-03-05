
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Check, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    
    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      setSuccess(true);
      toast("Mot de passe mis à jour", {
        description: "Votre mot de passe a été réinitialisé avec succès."
      });
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "Une erreur s'est produite lors de la réinitialisation du mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-bgs-blue mb-2">Réinitialiser votre mot de passe</h1>
              <p className="text-bgs-blue/70">
                Créez un nouveau mot de passe pour votre compte
              </p>
            </div>
            
            <div className="glass-card p-6 md:p-8">
              {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              {success ? (
                <div className="text-center">
                  <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex flex-col items-center">
                    <Check size={48} className="mb-2" />
                    <p className="font-medium">Mot de passe réinitialisé avec succès!</p>
                    <p className="text-sm mt-1">Vous allez être redirigé vers la page de connexion...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-bgs-blue mb-1">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-bgs-blue/50" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                    <p className="text-xs text-bgs-gray-medium mt-1">
                      Minimum 6 caractères
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="passwordConfirm" className="block text-sm font-medium text-bgs-blue mb-1">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-bgs-blue/50" />
                      </div>
                      <input
                        id="passwordConfirm"
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Réinitialisation en cours...
                      </>
                    ) : (
                      "Réinitialiser le mot de passe"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
