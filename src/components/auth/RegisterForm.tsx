
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, AlertCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NameFields from "./NameFields";
import EmailField from "./EmailField";
import PasswordFields from "./PasswordFields";
import TermsCheckbox from "./TermsCheckbox";
import { registerUser } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralError, setReferralError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  // Extract referral code from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const codeFromUrl = params.get('ref');
    if (codeFromUrl) {
      setReferralCode(codeFromUrl);
    }
  }, [location]);

  const validateReferralCode = async (code: string) => {
    if (!code) return true; // No code is valid
    
    try {
      const { data, error } = await supabase
        .rpc('verify_referral_code', { code });
        
      if (error) throw error;
      
      return !!data; // True if referrer found, false otherwise
    } catch (err) {
      console.error("Error verifying referral code:", err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setReferralError("");

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (!termsAccepted) {
      setError("Vous devez accepter les conditions d'utilisation");
      return;
    }

    // Validate referral code if provided
    if (referralCode) {
      setIsLoading(true);
      const isValidReferral = await validateReferralCode(referralCode);
      if (!isValidReferral) {
        setReferralError("Code de parrainage invalide");
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    
    try {
      console.log("Tentative d'inscription avec:", { firstName, lastName, email, referralCode });
      const result = await registerUser({
        firstName,
        lastName,
        email,
        password,
        referralCode
      });

      if (result.success) {
        console.log("Inscription réussie:", result.data);
        toast({
          title: "Inscription réussie",
          description: referralCode 
            ? "Votre compte a été créé avec succès et le code de parrainage a été appliqué" 
            : "Votre compte a été créé avec succès"
        });
        
        // Redirection vers le tableau de bord après inscription réussie
        navigate("/dashboard");
      } else {
        console.error("Erreur d'inscription:", result.error);
        setError(result.error || "Une erreur s'est produite lors de l'inscription");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Une erreur s'est produite lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 md:p-8">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
        
        <div className="space-y-2">
          <Label htmlFor="referralCode">Code de parrainage (optionnel)</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="referralCode"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Entrez le code de parrainage"
              className="pl-10"
            />
          </div>
          {referralError && (
            <p className="text-sm font-medium text-red-500">{referralError}</p>
          )}
          <p className="text-xs text-gray-500">
            Si vous avez été parrainé, veuillez entrer le code de parrainage.
          </p>
        </div>
        
        <TermsCheckbox 
          termsAccepted={termsAccepted} 
          setTermsAccepted={setTermsAccepted} 
        />
        
        <Button 
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
        </Button>
      </form>
    </div>
  );
}
