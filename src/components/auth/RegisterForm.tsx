
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import EmailField from "./EmailField";
import PasswordFields from "./PasswordFields";
import NameFields from "./NameFields";
import TermsCheckbox from "./TermsCheckbox";

const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions d'utilisation"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setDetailedError(null);
    
    try {
      console.log("Étape 1: Début de l'inscription avec email:", data.email);
      
      // Ajout des métadonnées pour l'utilisateur
      const metadata = {
        firstName: data.firstName,
        lastName: data.lastName,
      };
      
      console.log("Étape 2: Appel de la fonction signup avec les métadonnées:", metadata);
      console.log("Informations d'inscription:", { email: data.email, password: "***HIDDEN***", metadata });
      
      // Use the AuthContext signup function instead of direct Supabase call
      const { user, error } = await signup(data.email, data.password, metadata);
      
      console.log("Étape 3: Résultat de l'inscription:", user ? "Succès" : "Échec", error ? "Avec erreur" : "Sans erreur");
      
      if (error) {
        console.error("Étape 3a: Erreur complète:", error);
        console.error("Étape 3b: Message d'erreur:", error.message);
        console.error("Étape 3c: Code d'erreur:", error.code);
        setDetailedError(error);
        throw error;
      }
      
      if (user) {
        console.log("Étape 4: Inscription réussie pour:", user.email);
        toast.success("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.");
        navigate("/login");
      } else {
        // If no user but also no error, something unusual happened
        console.error("Étape 4a: Cas inattendu - pas d'utilisateur mais pas d'erreur");
        throw new Error("Une erreur inattendue est survenue lors de l'inscription.");
      }
    } catch (error: any) {
      console.error("Étape X: Erreur complète lors de l'inscription:", error);
      
      if (error.error) {
        console.error("Erreur interne:", error.error);
      }
      
      if (error.code) {
        console.error("Code d'erreur:", error.code);
      }
      
      if (error.details) {
        console.error("Détails de l'erreur:", error.details);
      }
      
      if (error.status) {
        console.error("Status HTTP:", error.status);
      }
      
      console.error("JSON détaillé de l'erreur:", JSON.stringify(error, null, 2));
      
      if (error.message?.includes("already registered") || error.message?.includes("déjà enregistré")) {
        setError("Cette adresse email est déjà utilisée.");
      } else if (error.message?.includes("Database error saving new user")) {
        setError("Une erreur s'est produite lors de la création de votre compte. Nos équipes ont été informées de ce problème.");
        console.error("Erreur de base de données lors de l'enregistrement:", JSON.stringify(error));
      } else if (error.message?.includes("ambiguous")) {
        // Specifically handle the "code is ambiguous" error
        setError("Une erreur est survenue lors de la création de votre compte. Veuillez réessayer.");
        console.error("Erreur de colonne ambiguë pendant l'inscription:", JSON.stringify(error));
      } else if (error.message?.includes("database") || error.message?.includes("code")) {
        setError("Une erreur technique est survenue. Veuillez réessayer ultérieurement.");
        console.error("Erreur technique de base de données pendant l'inscription:", JSON.stringify(error));
      } else {
        setError(`Erreur lors de l'inscription: ${error.message || "Erreur inconnue"}`);
        console.error("Erreur générique d'inscription:", JSON.stringify(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <NameFields />
        <EmailField />
        <PasswordFields />
        <TermsCheckbox />
        
        {detailedError && (
          <div className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">
            <p>Information technique (pour le support):</p>
            <pre className="whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify({ message: detailedError.message, code: detailedError.code }, null, 2)}
            </pre>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-bgs-blue hover:bg-bgs-blue/90 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Inscription en cours..." : "S'inscrire"}
        </Button>
      </form>
    </Form>
  );
}
