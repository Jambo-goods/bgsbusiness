
import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PendingInvestment } from "@/types/investment";

interface SuccessDisplayProps {
  pendingInvestment: PendingInvestment | null;
}

export default function SuccessDisplay({ pendingInvestment }: SuccessDisplayProps) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Investissement confirmé !</h1>
            <p className="text-gray-600 max-w-md">
              Votre investissement de {pendingInvestment?.amount.toLocaleString()}€ dans {pendingInvestment?.projectName} a été réalisé avec succès.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-green-700 text-center">
              Redirection vers votre tableau de bord...
            </p>
            <Progress value={100} className="h-2 mt-2 bg-green-200" />
          </div>
          <div className="flex justify-center">
            <Button
              className="bg-gradient-to-r from-bgs-blue to-bgs-blue-light"
              onClick={() => navigate("/dashboard")}
            >
              Aller au tableau de bord
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
