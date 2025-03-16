
import React from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useInvestmentTracking } from "./hooks/useInvestmentTracking";
import GeneralInformationCard from "./components/GeneralInformationCard";
import InvestmentSummaryCards from "./components/InvestmentSummaryCards";
import TransactionHistoryCard from "./components/TransactionHistoryCard";
import ProjectUpdatesCard from "./components/ProjectUpdatesCard";
import ContactActionsCard from "./components/ContactActionsCard";

export default function InvestmentTrackingPage() {
  const { investmentId } = useParams();
  const { 
    investment, 
    transactions
  } = useInvestmentTracking(investmentId);
  
  // Error state - no investment found
  if (!investment) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center py-8">
          <p className="text-bgs-gray-medium mb-4">Investissement non trouvé</p>
          <p className="text-gray-500 mb-4">L'investissement que vous recherchez n'existe pas ou vous n'y avez pas accès.</p>
          <Link to="/dashboard" className="text-bgs-blue hover:text-bgs-blue-light underline">
            Retour au tableau de bord
          </Link>
        </div>
      </DashboardLayout>
    );
  }
  
  // User data for header
  const userData = {
    firstName: investment.user_first_name || "Investisseur",
    lastName: investment.user_last_name || "",
  };

  return (
    <DashboardLayout>
      <DashboardHeader 
        userData={userData}
      />
      
      <div className="space-y-8">
        <Link to="/dashboard" className="flex items-center text-bgs-blue hover:text-bgs-blue-light mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour au tableau de bord
        </Link>
        
        {/* Section 1: General Information */}
        <GeneralInformationCard investment={investment} />
        
        {/* Section 2: Investment Summary Cards */}
        <InvestmentSummaryCards investment={investment} transactions={transactions} />
        
        {/* Section 3: Transaction History */}
        <TransactionHistoryCard transactions={transactions} />
        
        {/* Section 4: Project Updates */}
        <ProjectUpdatesCard />
        
        {/* Section 5: Contact Actions */}
        <ContactActionsCard />
      </div>
    </DashboardLayout>
  );
}
