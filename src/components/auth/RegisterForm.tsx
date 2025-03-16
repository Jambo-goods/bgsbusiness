
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, AlertCircle } from "lucide-react";
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

interface RegisterFormProps {
  initialReferralCode?: string | null;
}

export default function RegisterForm({ initialReferralCode = null }: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [referralCode, setReferralCode] = useState(initialReferralCode || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extract referral code from URL if present and not already set by props
  useEffect(() => {
    if (!initialReferralCode) {
      const params = new URLSearchParams(location.search);
      const ref = params.get('ref');
      if (ref) {
        setReferralCode(ref);
      }
    }
  }, [location, initialReferralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
          description: "Votre compte a été créé avec succès"
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
          <Input
            id="referralCode"
            placeholder="Entrez le code de parrainage si vous en avez un"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="w-full"
          />
          {referralCode && (
            <p className="text-green-600 text-xs mt-1">
              Code de parrainage détecté. Vous recevrez un bonus de 25€ sur votre premier investissement !
            </p>
          )}
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
