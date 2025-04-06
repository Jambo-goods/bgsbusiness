
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RegisterForm from "@/components/auth/RegisterForm";

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen page-transition bg-bgs-gray-light">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-bgs-blue mb-3">Créer un compte</h1>
              <p className="text-bgs-blue/70 max-w-md mx-auto">
                Rejoignez BGS Business Club et commencez à investir dans des projets à fort potentiel
              </p>
            </div>
            
            <RegisterForm />
            
            <div className="mt-6 text-center">
              <p className="text-bgs-blue/80">
                Vous avez déjà un compte ?{" "}
                <Link to="/login" className="text-bgs-orange font-semibold hover:text-bgs-orange-light underline underline-offset-2">
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
