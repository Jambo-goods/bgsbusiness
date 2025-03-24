import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    // Reset errors
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: ''
    };
    
    // Validate form fields
    let hasError = false;
    
    if (!firstName) {
      newErrors.firstName = 'Le prénom est requis';
      hasError = true;
    }
    
    if (!lastName) {
      newErrors.lastName = 'Le nom est requis';
      hasError = true;
    }
    
    if (!email) {
      newErrors.email = 'L\'email est requis';
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'L\'email n\'est pas valide';
      hasError = true;
    }
    
    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      hasError = true;
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      hasError = true;
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'Vous devez accepter les conditions générales';
      hasError = true;
    }
    
    setErrors(newErrors);
    
    if (hasError) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) throw error;
      
      if (data) {
        toast({
          title: "Compte créé avec succès !",
          description: "Veuillez vérifier votre email pour confirmer votre compte.",
          variant: "default",
        });
        
        // Redirect to login page after successful registration
        navigate('/login');
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Créer un compte</CardTitle>
        <CardDescription>
          Entrez vos informations pour créer un nouveau compte
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input 
            id="firstName" 
            placeholder="Votre prénom" 
            type="text" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            aria-invalid={!!errors.firstName}
          />
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input 
            id="lastName" 
            placeholder="Votre nom" 
            type="text" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            aria-invalid={!!errors.lastName}
          />
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            placeholder="exemple@exemple.com" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input 
            id="confirmPassword" 
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="terms" 
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(!!checked)}
            aria-invalid={!!errors.terms}
          />
          <div className="grid gap-2">
            <Label htmlFor="terms" className="cursor-pointer">
              J'accepte les <Link to="/terms" className="text-blue-500 hover:underline">conditions générales</Link>
            </Label>
            {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}
          </div>
        </div>
        {errorMessage && (
          <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
            {errorMessage}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <button
          type="submit"
          className="w-full bg-bgs-blue hover:bg-bgs-blue-dark text-white font-semibold py-3 px-6 rounded-md transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Création en cours..." : "Créer un compte"}
        </button>
      </CardFooter>
    </Card>
  );
}
