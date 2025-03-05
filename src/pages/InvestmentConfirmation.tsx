
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, TrendingUp, Lock, ShieldCheck, Calendar, DollarSign, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface PendingInvestment {
  projectId: string;
  projectName: string;
  amount: number;
  duration: number;
  yield: number;
  timestamp: string;
}

export default function InvestmentConfirmation() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [pendingInvestment, setPendingInvestment] = useState<PendingInvestment | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    // Get pending investment from localStorage
    const storedInvestment = localStorage.getItem("pendingInvestment");
    if (storedInvestment) {
      const investment = JSON.parse(storedInvestment);
      if (investment.projectId === projectId) {
        setPendingInvestment(investment);
      } else {
        setError("Les détails de l'investissement ne correspondent pas au projet actuel");
      }
    } else {
      setError("Aucun investissement en attente trouvé");
    }
    setLoading(false);
  }, [projectId]);

  const handleConfirmInvestment = async () => {
    if (!pendingInvestment) return;
    
    setConfirming(true);
    try {
      // Step 1: Verify authentication
      setProcessingStep(1);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
        return;
      }

      // Calculate end date
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + pendingInvestment.duration);

      // Step 2: Create the investment record
      setProcessingStep(2);
      const { error: investmentError } = await supabase.from('investments').insert({
        user_id: user.id,
        project_id: pendingInvestment.projectId,
        amount: pendingInvestment.amount,
        yield_rate: pendingInvestment.yield,
        duration: pendingInvestment.duration,
        end_date: endDate.toISOString(),
        date: new Date().toISOString()
      });
      
      if (investmentError) {
        console.error("Erreur lors de la création de l'investissement:", investmentError);
        toast.error("Impossible de créer l'investissement");
        return;
      }

      // Step 3: Create transaction record
      setProcessingStep(3);
      const { error: transactionError } = await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        amount: -pendingInvestment.amount,
        type: 'investment',
        description: `Investissement dans ${pendingInvestment.projectName}`
      });
      
      if (transactionError) {
        console.error("Erreur lors de la création de la transaction:", transactionError);
        toast.error("Impossible de créer la transaction");
        return;
      }

      // Step 4: Update wallet balance
      setProcessingStep(4);
      const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
        user_id: user.id,
        increment_amount: -pendingInvestment.amount
      });
      
      if (balanceError) {
        console.error("Erreur lors de la mise à jour du solde:", balanceError);
        toast.error("Impossible de mettre à jour votre solde");
        return;
      }

      // Step 5: Update user profile stats
      setProcessingStep(5);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('investment_total, projects_count')
        .eq('id', user.id)
        .single();
      
      if (!profileError && profileData) {
        const { data: existingInvestments } = await supabase
          .from('investments')
          .select('id')
          .eq('user_id', user.id)
          .eq('project_id', pendingInvestment.projectId);

        const newTotal = (profileData.investment_total || 0) + pendingInvestment.amount;
        let newCount = profileData.projects_count || 0;
        
        if (existingInvestments && existingInvestments.length <= 1) {
          newCount += 1;
        }

        await supabase.from('profiles').update({
          investment_total: newTotal,
          projects_count: newCount
        }).eq('id', user.id);
      }

      // Store recent investment details for dashboard display
      localStorage.setItem("recentInvestment", JSON.stringify({
        projectId: pendingInvestment.projectId,
        amount: pendingInvestment.amount,
        duration: pendingInvestment.duration,
        yield: pendingInvestment.yield,
        projectName: pendingInvestment.projectName,
        timestamp: new Date().toISOString()
      }));

      // Clear the pending investment
      localStorage.removeItem("pendingInvestment");
      
      // Display success message
      toast.success("Investissement réalisé avec succès !");
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la confirmation de l'investissement:", error);
      toast.error("Une erreur est survenue lors de la confirmation de l'investissement");
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    navigate(`/project/${projectId}`);
  };

  // Function to calculate expected returns
  const calculateReturns = (amount: number, yieldRate: number, duration: number) => {
    const monthlyYield = amount * (yieldRate / 100);
    const totalReturn = amount + (monthlyYield * duration);
    return {
      monthlyReturn: monthlyYield,
      totalReturn: totalReturn
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bgs-blue"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-3 text-red-600 mb-4">
              <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Erreur</h1>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux projets
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
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
              onClick={() => navigate(`/project/${projectId}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au projet
            </Button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-bgs-blue/10 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-bgs-blue" />
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
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-blue-700 mb-2">Traitement en cours...</h3>
                    <Progress value={(processingStep / 5) * 100} className="h-2 mb-3" />
                    <p className="text-sm text-blue-600">
                      {processingStep === 1 && "Vérification de votre compte..."}
                      {processingStep === 2 && "Création de l'investissement..."}
                      {processingStep === 3 && "Enregistrement de la transaction..."}
                      {processingStep === 4 && "Mise à jour de votre portefeuille..."}
                      {processingStep === 5 && "Finalisation de l'opération..."}
                    </p>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h2 className="font-semibold text-lg mb-4 text-gray-800 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-bgs-blue" />
                      Détails de l'investissement
                    </h2>
                    <div className="space-y-4">
                      <div className="flex justify-between pb-2 border-b border-gray-200">
                        <span className="text-gray-600">Projet</span>
                        <span className="font-medium text-gray-900">{pendingInvestment.projectName}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-gray-200">
                        <span className="text-gray-600">Montant investi</span>
                        <span className="font-medium text-gray-900">{pendingInvestment.amount.toLocaleString()}€</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-gray-200">
                        <span className="text-gray-600">Durée</span>
                        <span className="font-medium text-gray-900 flex items-center">
                          <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                          {pendingInvestment.duration} mois
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taux de rendement</span>
                        <span className="font-medium text-green-600 flex items-center">
                          <Percent className="h-4 w-4 mr-1.5" />
                          {pendingInvestment.yield}% par mois
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h2 className="font-semibold text-lg mb-4 text-gray-800 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Prévision des rendements
                    </h2>
                    {pendingInvestment && (
                      <div className="space-y-4">
                        <div className="flex justify-between pb-2 border-b border-gray-200">
                          <span className="text-gray-600">Rendement mensuel</span>
                          <span className="font-medium text-green-600">
                            {calculateReturns(pendingInvestment.amount, pendingInvestment.yield, pendingInvestment.duration).monthlyReturn.toLocaleString(undefined, {maximumFractionDigits: 2})}€
                          </span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-gray-200">
                          <span className="text-gray-600">Rendement total</span>
                          <span className="font-medium text-green-600">
                            {calculateReturns(pendingInvestment.amount, pendingInvestment.yield, pendingInvestment.duration).totalReturn.toLocaleString(undefined, {maximumFractionDigits: 2})}€
                          </span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-gray-200">
                          <span className="text-gray-600">Capital initial</span>
                          <span className="font-medium text-gray-900">{pendingInvestment.amount.toLocaleString()}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Intérêts générés</span>
                          <span className="font-medium text-green-600">
                            {(calculateReturns(pendingInvestment.amount, pendingInvestment.yield, pendingInvestment.duration).totalReturn - pendingInvestment.amount).toLocaleString(undefined, {maximumFractionDigits: 2})}€
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-lg mb-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-700 mb-1">Sécurité & Protection</h3>
                      <p className="text-sm text-blue-600">
                        Votre investissement est sécurisé par contrat et conforme à la réglementation financière en vigueur. 
                        Les fonds seront directement transférés au projet et votre investissement sera suivi en temps réel.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row gap-3 justify-end items-center">
                  <div className="flex items-center gap-1.5 text-gray-500 mr-auto">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm">Transaction sécurisée</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={confirming}
                    className="w-full md:w-auto"
                  >
                    Annuler
                  </Button>
                  <Button
                    className="w-full md:w-auto bg-gradient-to-r from-bgs-blue to-bgs-blue-light hover:shadow-lg transition-all duration-300 text-white"
                    onClick={handleConfirmInvestment}
                    disabled={confirming}
                  >
                    {confirming ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Confirmation en cours...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Confirmer l'investissement
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
