
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoadingDisplay from "@/components/investment-confirmation/LoadingDisplay";
import ErrorDisplay from "@/components/investment-confirmation/ErrorDisplay";
import SuccessDisplay from "@/components/investment-confirmation/SuccessDisplay";
import InvestmentDetailsCard from "@/components/investment-confirmation/InvestmentDetailsCard";
import ReturnsProjectionCard from "@/components/investment-confirmation/ReturnsProjectionCard";
import SecuritySection from "@/components/investment-confirmation/SecuritySection";
import ProcessingIndicator from "@/components/investment-confirmation/ProcessingIndicator";
import ActionButtons from "@/components/investment-confirmation/ActionButtons";
import { useInvestmentConfirmation } from "@/hooks/useInvestmentConfirmation";

export default function InvestmentConfirmation() {
  const {
    pendingInvestment,
    loading,
    confirming,
    error,
    processingStep,
    success,
    handleConfirmInvestment,
    handleCancel
  } = useInvestmentConfirmation();

  if (loading) {
    return <LoadingDisplay />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (success) {
    return <SuccessDisplay pendingInvestment={pendingInvestment} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          {/* Top navigation */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au projet
            </Button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-bgs-blue/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bgs-blue">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
              Confirmation de votre investissement
            </h1>
            
            <p className="text-center text-gray-600 mb-8 max-w-lg mx-auto">
              Veuillez vérifier les détails de votre investissement avant de confirmer.
            </p>

            {pendingInvestment && (
              <div className="space-y-6">
                {confirming && (
                  <ProcessingIndicator processingStep={processingStep} />
                )}
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <InvestmentDetailsCard pendingInvestment={pendingInvestment} />
                  <ReturnsProjectionCard pendingInvestment={pendingInvestment} />
                </div>
                
                <SecuritySection />

                <ActionButtons 
                  confirming={confirming}
                  onConfirm={handleConfirmInvestment}
                  onCancel={handleCancel}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
