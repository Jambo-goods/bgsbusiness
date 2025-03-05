
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email) {
        setError("Veuillez entrer votre adresse email");
        return;
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      setSuccess(true);
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe",
      });
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de la demande de réinitialisation");
      console.error("Password reset error:", err);
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
              <h1 className="text-3xl font-bold text-bgs-blue mb-2">Mot de passe oublié</h1>
              <p className="text-bgs-blue/70">
                Nous vous enverrons un lien pour réinitialiser votre mot de passe
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
                  <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                    Un email a été envoyé à {email} avec les instructions pour réinitialiser votre mot de passe.
                  </div>
                  <Link to="/login" className="text-bgs-orange hover:text-bgs-orange-light font-medium inline-flex items-center">
                    <ArrowLeft size={18} className="mr-2" />
                    Retour à la connexion
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                        placeholder="votre@email.com"
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
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer le lien de réinitialisation"
                    )}
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
