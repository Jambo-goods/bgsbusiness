
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { registerUser, UserRegistrationData } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";

const registerFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide",
  }),
  password: z.string().min(8, {
    message: "Le mot de passe doit contenir au moins 8 caractères",
  }),
  referralCode: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize the form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      referralCode: searchParams.get("ref") || "",
    },
  });
  
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // Build the proper registration data
      const registrationData: UserRegistrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        referralCode: data.referralCode
      };

      const result = await registerUser(registrationData);
      
      if (result.success) {
        toast.success("Inscription réussie ! Bienvenue chez BGS Groupe.");
        
        // If there's a referral code, process the referral
        if (data.referralCode) {
          try {
            // Get the user session after registration
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session?.user) {
              // Look up the referrer ID using the referral code
              const { data: referralCodeData } = await supabase
                .from('referral_codes')
                .select('user_id')
                .eq('code', data.referralCode)
                .single();
              
              if (!referralCodeData) {
                console.error("Referral code not found");
              } else {
                // Create a referral record
                await supabase
                  .from('referrals')
                  .insert({
                    referrer_id: referralCodeData.user_id,
                    referred_id: sessionData.session.user.id,
                    status: 'pending',
                    referred_rewarded: true // The referred user gets their reward immediately
                  });
                
                // Add the welcome bonus to the new user's wallet
                await supabase.rpc('add_referral_reward', {
                  user_id_param: sessionData.session.user.id,
                  amount_param: 25,
                  description_param: 'Bonus de bienvenue (code parrainage utilisé)'
                });
              }
            }
          } catch (error) {
            console.error("Error processing referral:", error);
          }
        }
        
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        toast.error(result.error || "Une erreur est survenue lors de l'inscription");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Extract referral code from URL if present
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      form.setValue("referralCode", refCode);
    }
  }, [searchParams, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Jean" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="jean.dupont@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="referralCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code de parrainage (optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="BGSREF123" {...field} />
              </FormControl>
              <FormMessage />
              {field.value && (
                <p className="text-xs text-green-600">
                  Vous recevrez 25€ de bonus à l'inscription
                </p>
              )}
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Création du compte..." : "S'inscrire"}
        </Button>
      </form>
    </Form>
  );
}
