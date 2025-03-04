
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { ArrowRight } from "lucide-react";
import NameFields from "./NameFields";
import EmailField from "./EmailField";
import PasswordFields from "./PasswordFields";
import TermsCheckbox from "./TermsCheckbox";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();

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
      // Pass user data as a single object instead of separate arguments
      await register({
        firstName,
        lastName,
        email,
        password
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite lors de l'inscription");
      console.error("Registration error:", err);
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
