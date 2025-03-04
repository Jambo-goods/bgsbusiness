
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/components/ui/use-toast";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (user: Omit<User, "id">) => boolean;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    // In a real app, this would call an API
    // For demo purposes, we'll check localStorage for registered users
    const usersStr = localStorage.getItem("registeredUsers");
    if (usersStr) {
      try {
        const users: User[] = JSON.parse(usersStr);
        const foundUser = users.find(
          (u) => u.email === email && u.password === password
        );
        
        if (foundUser) {
          // Remove password from user object before storing in state
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem("user", JSON.stringify(userWithoutPassword));
          toast({
            title: "Connexion réussie",
            description: "Bienvenue sur votre espace BGS Business Club",
          });
          return true;
        }
      } catch (error) {
        console.error("Error parsing registered users:", error);
      }
    }
    
    toast({
      variant: "destructive",
      title: "Échec de la connexion",
      description: "Email ou mot de passe incorrect",
    });
    return false;
  };

  const register = (userData: Omit<User, "id">): boolean => {
    // In a real app, this would call an API
    // For demo purposes, we'll store in localStorage
    try {
      const usersStr = localStorage.getItem("registeredUsers");
      let users: User[] = usersStr ? JSON.parse(usersStr) : [];
      
      // Check if email already exists
      if (users.some((u) => u.email === userData.email)) {
        toast({
          variant: "destructive",
          title: "Inscription échouée",
          description: "Cet email est déjà utilisé",
        });
        return false;
      }
      
      // Create new user with generated ID
      const newUser: User = {
        ...userData,
        id: crypto.randomUUID(),
      };
      
      // Add to registered users
      users.push(newUser);
      localStorage.setItem("registeredUsers", JSON.stringify(users));
      
      // Log user in (remove password from state)
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      
      toast({
        title: "Inscription réussie",
        description: "Bienvenue sur BGS Business Club",
      });
      return true;
    } catch (error) {
      console.error("Error registering user:", error);
      toast({
        variant: "destructive",
        title: "Inscription échouée",
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur BGS Business Club",
    });
  };

  const updateUser = (updatedUser: User) => {
    try {
      // Update the current user in state
      setUser(updatedUser);
      
      // Update the user in localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update the user in the registered users list
      const usersStr = localStorage.getItem("registeredUsers");
      if (usersStr) {
        const users: User[] = JSON.parse(usersStr);
        const updatedUsers = users.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        );
        localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Mise à jour échouée",
        description: "Une erreur est survenue lors de la mise à jour de votre profil.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
