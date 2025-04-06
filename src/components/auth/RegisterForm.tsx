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
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";

// Schema for form validation
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
      
      const { success, error, data } = await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        referralCode: values.referralCode || referralFromLink || null,
      });
      
      if (!success) {
        toast.error("Erreur d'inscription", {
          description: error?.message || "Une erreur s'est produite lors de l'inscription",
        });
        return;
      }
      
      toast.success("Inscription réussie", {
        description: "Connectez-vous pour accéder à votre tableau de bord",
      });
      
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Erreur d'inscription", {
        description: error.message || "Une erreur s'est produite lors de l'inscription",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <NameFields form={form} />
      
      <EmailField form={form} />
      
      <PasswordFields form={form} />
      
      <div className="space-y-1">
        <label htmlFor="referralCode" className="text-sm font-medium text-bgs-blue">
          Code de parrainage (optionnel)
        </label>
        <Input
          id="referralCode"
          {...form.register("referralCode")}
          placeholder={referralFromLink ? "Code automatiquement appliqué" : "Entrez un code de parrainage si vous en avez un"}
          className={referralFromLink ? "bg-gray-50 border-green-200" : ""}
          readOnly={!!referralFromLink}
        />
        {referralFromLink && (
          <p className="text-xs text-green-600">
            Un code de parrainage a été appliqué depuis votre lien. Vous recevrez 25€ à l'inscription.
          </p>
        )}
      </div>
      
      <TermsCheckbox form={form} />
      
      <Button 
        type="submit" 
        className="w-full bg-bgs-blue hover:bg-bgs-blue-light text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
      </Button>
    </form>
  );
}
