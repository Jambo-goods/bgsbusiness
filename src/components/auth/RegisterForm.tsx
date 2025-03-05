
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NameFields from "./NameFields";
import EmailField from "./EmailField";
import PasswordFields from "./PasswordFields";
import TermsCheckbox from "./TermsCheckbox";
import { supabase } from "@/integrations/supabase/client";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation basique
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (!termsAccepted) {
      setError("Vous devez accepter les conditions d'utilisation");
      return;
    }
    
    setIsLoading(true);

    try {
      // Tenter de s'inscrire avec Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (data && data.user) {
        // S'assurer que les valeurs du profil sont correctement initialisées à 0
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            wallet_balance: 0,
            investment_total: 0,
            projects_count: 0
          })
          .eq('id', data.user.id);
        
        if (profileError) {
          console.error("Erreur lors de l'initialisation du profil:", profileError);
        }
        
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès",
        });
        
        // Stocker les données utilisateur dans localStorage
        const userData = {
          firstName,
          lastName,
          email,
          wallet_balance: 0,
          investment_total: 0,
          projects_count: 0
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      
      // Afficher un message d'erreur plus convivial
      if (err.message?.includes("email") || err.message?.includes("already registered")) {
        setError("Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.");
      } else {
        setError("Une erreur s'est produite lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 md:p-8">
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertCircle size={18} className="mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <NameFields
          firstName={firstName}
          lastName={lastName}
          setFirstName={setFirstName}
          setLastName={setLastName}
        />
        
        <EmailField
          email={email}
          setEmail={setEmail}
        />
        
        <PasswordFields
          password={password}
          confirmPassword={confirmPassword}
          setPassword={setPassword}
          setConfirmPassword={setConfirmPassword}
        />
        
        <TermsCheckbox
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
        />
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {isLoading ? "Inscription en cours..." : (
            <>
              Créer mon compte
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
