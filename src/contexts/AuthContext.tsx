
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Define the User type
interface User {
  email: string;
  firstName: string;
  lastName: string;
}

// Define the context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// Create the AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for user in localStorage on initial load
  useEffect(() => {
    const checkUserAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation for demo
      if (email && password) {
        console.log("Login attempt with:", { email });
        
        // For demo purposes, any login credentials will work
        const userData = {
          email,
          firstName: "Utilisateur",
          lastName: "BGS"
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur votre tableau de bord",
        });
        
        navigate("/dashboard");
      } else {
        throw new Error("Veuillez remplir tous les champs");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur s'est produite lors de la connexion";
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Registration attempt with:", { firstName, lastName, email });
      
      // For demo purposes, create a user and store in localStorage
      const userData = {
        firstName,
        lastName,
        email
      };
      
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      });
      
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur s'est produite lors de l'inscription";
      toast({
        title: "Erreur d'inscription",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
    });
    navigate("/login");
  };

  // Create the context value
  const value = {
    user,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
