
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
        return;
      }

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + pendingInvestment.duration);

      // Create the investment record
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

      // Create transaction record
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

      // Update wallet balance
      const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
        user_id: user.id,
        increment_amount: -pendingInvestment.amount
      });
      
      if (balanceError) {
        console.error("Erreur lors de la mise à jour du solde:", balanceError);
        toast.error("Impossible de mettre à jour votre solde");
        return;
      }

      // Update user profile stats
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
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-6">
            Confirmation de votre investissement
          </h1>

          {pendingInvestment && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="font-semibold text-lg mb-3 text-gray-800">Détails de l'investissement</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projet</span>
                    <span className="font-medium">{pendingInvestment.projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant</span>
                    <span className="font-medium">{pendingInvestment.amount}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durée</span>
                    <span className="font-medium">{pendingInvestment.duration} mois</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rendement attendu</span>
                    <span className="font-medium text-green-600">{pendingInvestment.yield}%</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 flex flex-col-reverse md:flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={confirming}
                >
                  Annuler
                </Button>
                <Button
                  className="bg-gradient-to-r from-bgs-blue to-bgs-blue-light hover:shadow-lg transition-all duration-300 text-white"
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
      </main>
      <Footer />
    </div>
  );
}
