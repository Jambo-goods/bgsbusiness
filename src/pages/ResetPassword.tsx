
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { updatePassword } from "@/services/authService";
import PasswordFields from "@/components/auth/PasswordFields";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/forgot-password");
      }
      setSessionChecked(true);
    };
    
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    setIsLoading(true);

    try {
      const { success, error } = await updatePassword(password);
      
      if (!success) {
        setError(error || "Une erreur s'est produite lors de la réinitialisation du mot de passe");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError("Une erreur s'est produite lors de la réinitialisation du mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  if (!sessionChecked) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">Vérification de votre session...</div>
    </div>;
  }

  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-bgs-blue mb-2">Réinitialiser le mot de passe</h1>
              <p className="text-bgs-blue/70">
                Créez un nouveau mot de passe sécurisé
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
                    <CheckCircle size={48} className="text-green-500 mb-2" />
                    <h3 className="font-medium mb-1">Mot de passe mis à jour !</h3>
                    <p>Votre mot de passe a été réinitialisé avec succès.</p>
                  </div>
                  
                  <Link to="/login" className="btn-primary inline-flex items-center">
                    Se connecter
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <PasswordFields 
                    password={password}
                    confirmPassword={confirmPassword}
                    setPassword={setPassword}
                    setConfirmPassword={setConfirmPassword}
                  />
                  
                  <div className="bg-blue-50 p-3 rounded-lg flex items-start">
                    <Lock size={18} className="text-bgs-blue mt-0.5 mr-2" />
                    <p className="text-xs text-bgs-blue">
                      Choisissez un mot de passe sécurisé d'au moins 8 caractères, contenant des majuscules, minuscules, chiffres et caractères spéciaux.
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary"
                  >
                    {isLoading ? "Mise à jour en cours..." : "Réinitialiser le mot de passe"}
                  </button>
                  
                  <div className="text-center">
                    <Link to="/login" className="text-bgs-orange hover:text-bgs-orange-light font-medium inline-flex items-center">
                      <ArrowLeft size={18} className="mr-2" />
                      Retour à la connexion
                    </Link>
                  </div>
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
