
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { registerUser } from "@/services/authService";
import EmailField from "./EmailField";
import PasswordFields from "./PasswordFields";
import NameFields from "./NameFields";
import TermsCheckbox from "./TermsCheckbox";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";
import { ArrowRight, Gift, Check, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions d'utilisation"
  }),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralFromLink, setReferralFromLink] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
      referralCode: "",
    },
  });
  
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setReferralFromLink(refCode);
      form.setValue("referralCode", refCode);
    }
  }, [searchParams, form]);

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      setRegistrationError("");
      
      console.log("Attempting registration with values:", {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        referralCode: values.referralCode || referralFromLink || null
      });
      
      const result = await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        referralCode: values.referralCode || referralFromLink || null,
      });
      
      if (!result.success) {
        const errorMessage = typeof result.error === 'string' ? result.error : "Une erreur s'est produite lors de l'inscription";
        setRegistrationError(errorMessage);
        toast.error("Erreur d'inscription", {
          description: errorMessage,
        });
        return;
      }
      
      toast.success("Inscription réussie", {
        description: "Connectez-vous pour accéder à votre tableau de bord",
      });
      
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error?.message || "Une erreur s'est produite lors de l'inscription";
      setRegistrationError(errorMessage);
      toast.error("Erreur d'inscription", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-bgs-blue/5">
        {registrationError && (
          <Alert variant="destructive" className="bg-red-50 border border-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur d'inscription</AlertTitle>
            <AlertDescription className="text-sm">
              {registrationError}
            </AlertDescription>
          </Alert>
        )}
        
        <NameFields />
        
        <EmailField />
        
        <PasswordFields />
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Gift className="h-5 w-5 text-bgs-orange mr-2" />
            <label htmlFor="referralCode" className="text-sm font-semibold text-bgs-blue">
              Code de parrainage (optionnel)
            </label>
          </div>
          <Input
            id="referralCode"
            {...form.register("referralCode")}
            placeholder={referralFromLink ? "Code automatiquement appliqué" : "Entrez un code de parrainage si vous en avez un"}
            className={`bg-white border ${referralFromLink ? "border-green-300 bg-green-50" : "border-bgs-blue/20"} rounded-lg text-bgs-blue focus:border-bgs-orange focus:ring-2 focus:ring-bgs-orange/20`}
            readOnly={!!referralFromLink}
          />
          {referralFromLink && (
            <p className="text-xs text-green-600 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Un code de parrainage a été appliqué depuis votre lien. Vous recevrez 25€ à l'inscription.
            </p>
          )}
        </div>
        
        <TermsCheckbox />
        
        <Button 
          type="submit" 
          className="w-full bg-bgs-blue hover:bg-bgs-blue-light text-white font-medium py-2.5 flex items-center justify-center gap-2 text-base transition-all transform hover:translate-y-[-2px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Inscription en cours...
            </>
          ) : (
            <>
              S'inscrire
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
