
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../ui/button";
import { toast } from "sonner";
import EmailField from "./EmailField";
import NameFields from "./NameFields";
import PasswordFields from "./PasswordFields";
import TermsCheckbox from "./TermsCheckbox";
import { registerUser } from "@/services/authService";
import { Form } from "@/components/ui/form";

// Form schema with validations
const registerFormSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
    lastName: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50, "Le nom ne peut pas dépasser 50 caractères"),
    email: z.string().email("Adresse email invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { success, error, data } = await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      
      if (success) {
        toast.success("Inscription réussie ! Connexion en cours...");
        localStorage.setItem("user", JSON.stringify(data?.user));
        navigate("/dashboard");
      } else {
        toast.error(error || "Une erreur s'est produite lors de l'inscription");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
      >
        <NameFields />
        <EmailField />
        <PasswordFields />
        <TermsCheckbox />
        
        <Button
          type="submit"
          className="w-full bg-bgs-orange hover:bg-bgs-orange-dark text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Création du compte..." : "Créer un compte"}
        </Button>
      </form>
    </Form>
  );
}
