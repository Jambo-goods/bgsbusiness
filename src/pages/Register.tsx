
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user is already logged in
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate, user]);

  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-bgs-blue mb-2">Créer un compte</h1>
              <p className="text-bgs-blue/70">
                Rejoignez BGS Business Club et commencez à investir dans des projets à fort potentiel
              </p>
            </div>
            
            <RegisterForm />
            
            <div className="mt-6 text-center">
              <p className="text-bgs-blue/70">
                Vous avez déjà un compte ?{" "}
                <Link to="/login" className="text-bgs-orange hover:text-bgs-orange-light font-medium">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
