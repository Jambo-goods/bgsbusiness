
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { loginAdmin } from "@/services/adminAuthService";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { adminUser, setAdminUser } = useAdmin();

  useEffect(() => {
    // If already logged in, redirect to admin dashboard
    if (adminUser) {
      navigate("/admin/dashboard");
    }
  }, [adminUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      toast.error("Veuillez remplir tous les champs");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting admin login with:", email);
      const { success, error, admin } = await loginAdmin({ 
        email: email.trim(), 
        password: password.trim() 
      });
      
      if (!success) {
        setError(error || "Une erreur s'est produite lors de la connexion");
        toast.error(error || "Une erreur s'est produite lors de la connexion");
        setIsLoading(false);
        return;
      }
      
      if (admin) {
        toast.success("Connexion réussie");
        setAdminUser(admin);
        navigate("/admin/dashboard");
      }
    } catch (err: any) {
      console.error("Admin login error:", err);
      setError("Une erreur s'est produite lors de la connexion");
      toast.error("Une erreur s'est produite lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bgs-blue to-bgs-blue-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
          <p className="text-white/70">
            Accédez au tableau de bord administrateur
          </p>
        </div>
        
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl">
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 rounded-lg block w-full pl-10 p-2.5"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 rounded-lg block w-full pl-10 p-2.5"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-bgs-orange hover:bg-bgs-orange/90 text-white font-medium rounded-lg py-3 px-4 flex items-center justify-center gap-2"
            >
              {isLoading ? "Connexion en cours..." : (
                <>
                  Se connecter
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>Email: bamboguirassy93@gmail.com</p>
            <p>Mot de passe: Toshino201292@</p>
          </div>
        </div>
      </div>
    </div>
  );
}
