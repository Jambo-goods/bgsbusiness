
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
    
    try {
      // Use the AuthContext signup function instead of direct Supabase call
      const { user, error } = await signup(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      if (error) throw error;
      
      if (user) {
        toast.success("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.");
        navigate("/login");
      } else {
        // If no user but also no error, something unusual happened
        throw new Error("Une erreur inattendue est survenue lors de l'inscription.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.message?.includes("already registered") || error.message?.includes("déjà enregistré")) {
        setError("Cette adresse email est déjà utilisée.");
      } else if (error.message?.includes("database") || error.message?.includes("code") || error.message?.includes("ambiguous")) {
        setError("Une erreur technique est survenue. Nos équipes ont été notifiées et travaillent à résoudre ce problème.");
        // Log for debugging
        console.error("Technical database error during registration:", error);
      } else {
        setError(`Une erreur est survenue lors de l'inscription: ${error.message || "Erreur inconnue"}`);
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
