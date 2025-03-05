
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailNotConfirmed(false);
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError("Veuillez remplir tous les champs");
        setIsLoading(false);
        return;
      }
      
      // Authentification avec Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message === "Email not confirmed") {
          setEmailNotConfirmed(true);
          console.log("Email not confirmed error detected");
        } else if (error.message === "Invalid login credentials") {
          setError("Email ou mot de passe incorrect");
        } else {
          setError(error.message || "Une erreur s'est produite lors de la connexion");
        }
        throw error;
      }
      
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur votre tableau de bord",
      });
      
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError("Veuillez entrer votre adresse email");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      toast({
        title: "Email de confirmation envoyé",
        description: "Veuillez vérifier votre boîte de réception",
      });
    } catch (err: any) {
      console.error("Resend confirmation error:", err);
      setError(err.message || "Impossible d'envoyer l'email de confirmation");
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
              <h1 className="text-3xl font-bold text-bgs-blue mb-2">Connexion</h1>
              <p className="text-bgs-blue/70">
                Accédez à votre compte pour gérer vos investissements
              </p>
            </div>
            
            <div className="glass-card p-6 md:p-8">
              {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              {emailNotConfirmed && (
                <div className="bg-amber-100 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-6">
                  <p className="font-medium mb-2">Email non confirmé</p>
                  <p className="mb-2">Vous devez confirmer votre adresse email avant de pouvoir vous connecter.</p>
                  <button 
                    onClick={handleResendConfirmation}
                    className="text-amber-800 underline hover:text-amber-900"
                    disabled={isLoading}
                  >
                    {isLoading ? "Envoi en cours..." : "Renvoyer l'email de confirmation"}
                  </button>
                </div>
              )}
              
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
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-bgs-blue mb-1">
                    Mot de passe
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
                    />
                  </div>
                  <div className="flex justify-end mt-1">
                    <Link to="/forgot-password" className="text-sm text-bgs-orange hover:text-bgs-orange-light">
                      Mot de passe oublié ?
                    </Link>
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
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-bgs-blue/70">
                  Vous n'avez pas de compte ?{" "}
                  <Link to="/register" className="text-bgs-orange hover:text-bgs-orange-light font-medium">
                    S'inscrire
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

