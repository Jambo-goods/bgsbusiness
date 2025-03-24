
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { registerUser } from "@/services/authService";
import NameFields from "@/components/auth/NameFields";
import EmailField from "@/components/auth/EmailField";
import PasswordFields from "@/components/auth/PasswordFields";
import TermsCheckbox from "@/components/auth/TermsCheckbox";

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
      // Use the registerUser service instead of direct Supabase calls
      const { success, error } = await registerUser({
        firstName,
        lastName,
        email,
        password
      });
      
      if (success) {
        toast.success("Compte créé avec succès !", {
          description: "Veuillez vérifier votre email pour confirmer votre compte."
        });
        
        // Redirect to login page after successful registration
        navigate('/login');
      } else if (error) {
        console.error("Registration error:", error);
        setErrorMessage(error);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Entrez vos informations pour créer un nouveau compte
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
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
          
          <TermsCheckbox 
            termsAccepted={termsAccepted}
            setTermsAccepted={setTermsAccepted}
          />
          
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
          {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}
          
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
    </form>
  );
}
