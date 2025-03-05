
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import EmailField from "./EmailField";
import NameFields from "./NameFields";
import PasswordFields from "./PasswordFields";
import TermsCheckbox from "./TermsCheckbox";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Form validation
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs requis");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (!agreedToTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      
      if (error) throw error;
      
      // Success
      toast.success("Inscription réussie! Vérifiez votre email pour confirmer votre compte.");
      navigate("/login");
      
    } catch (err: any) {
      console.error("Registration error:", err);
      
      if (err.message === "User already registered") {
        setError("Cet email est déjà utilisé.");
      } else {
        setError(err.message || "Une erreur s'est produite lors de l'inscription.");
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
        <EmailField email={email} setEmail={setEmail} />
        
        <NameFields 
          firstName={firstName} 
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
        />
        
        <PasswordFields 
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
        />
        
        <TermsCheckbox 
          agreedToTerms={agreedToTerms}
          setAgreedToTerms={setAgreedToTerms}
        />
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Inscription en cours...
            </>
          ) : (
            "Créer mon compte"
          )}
        </button>
      </form>
    </div>
  );
}
