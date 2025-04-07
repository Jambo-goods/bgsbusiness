
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import RegisterForm from "@/components/auth/RegisterForm";
import Navbar from "@/components/layout/Navbar";

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  return (
    <>
      <Helmet>
        <title>Inscription | Finance App</title>
      </Helmet>
      
      <Navbar isScrolled={true} />
      
      <div className="min-h-screen pt-20 pb-16 flex flex-col items-center justify-center bg-bgs-gray-light">
        <div className="w-full max-w-md px-6 py-8 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold text-center text-bgs-blue mb-6">
            Créer un compte
          </h1>
          
          <RegisterForm />
          
          <div className="mt-6 text-center text-gray-600">
            Vous avez déjà un compte?{" "}
            <Link to="/login" className="text-bgs-blue hover:text-bgs-orange font-medium">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
