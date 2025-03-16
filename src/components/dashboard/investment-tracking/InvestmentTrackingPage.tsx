
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
  const { investment, transactions, loading, isRefreshing, refreshData } = useInvestmentTracking(investmentId);
  
  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bgs-blue"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  // No investment found state
  if (!investment) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Investissement non trouvé</div>
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
        refreshData={refreshData}
        isRefreshing={isRefreshing}
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
