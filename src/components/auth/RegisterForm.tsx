
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowRight, AlertCircle, Users, HelpCircle } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralError, setReferralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Check for referral code in URL parameters
  useEffect(() => {
    const codeFromUrl = searchParams.get("ref");
    if (codeFromUrl) {
      setReferralCode(codeFromUrl);
      validateReferralCode(codeFromUrl);
    }
  }, [searchParams]);

  const validateReferralCode = async (code: string) => {
    if (!code) return true;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('referral_code', code)
        .single();
      
      if (error || !data) {
        setReferralError("Code de parrainage invalide");
        return false;
      }
      
      setReferralError("");
      return true;
    } catch (err) {
      console.error("Error validating referral code:", err);
      setReferralError("Erreur lors de la vérification du code");
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
      const isValid = await validateReferralCode(referralCode);
      if (!isValid) return;
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
          description: "Votre compte a été créé avec succès. Vous pourrez trouver votre code de parrainage dans la section Parrainage du tableau de bord."
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
          <div className="flex justify-between items-center">
            <Label htmlFor="referralCode" className="text-bgs-blue">
              Code parrain (optionnel)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" side="top">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Comment utiliser un code parrain ?</h4>
                  <p className="text-xs text-muted-foreground">
                    Si quelqu'un vous a invité, vous pouvez:
                  </p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                    <li>Cliquer directement sur le lien de parrainage qu'ils vous ont envoyé (le code sera automatiquement rempli)</li>
                    <li>Ou saisir manuellement leur code parrain dans ce champ</li>
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    En utilisant un code parrain, vous bénéficierez tous les deux d'avantages.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="relative">
            <Input
              id="referralCode"
              type="text"
              value={referralCode}
              onChange={(e) => {
                setReferralCode(e.target.value);
                setReferralError("");
              }}
              placeholder="Entrez le code parrain si vous en avez un"
              className={`pl-9 ${referralError ? 'border-red-500' : ''}`}
            />
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bgs-blue/60" />
          </div>
          {referralError && <p className="text-red-500 text-sm mt-1">{referralError}</p>}
          <p className="text-sm text-bgs-blue/70">
            {searchParams.get("ref") ? (
              <>Un code parrain a été automatiquement ajouté depuis votre lien d'invitation.</>
            ) : (
              <>Si quelqu'un vous a parrainé, entrez son code ici. Après inscription, vous obtiendrez votre propre code de parrainage.</>
            )}
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
