
import { Project } from "@/types/project";
import DashboardCards from "./overview/DashboardCards";
import ChartsSection from "./overview/ChartsSection";
import RecentProjects from "./RecentProjects";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OverviewProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    investmentTotal: number;
    projectsCount: number;
  };
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
  refreshData: () => void;
}

export default function Overview({ userData, userInvestments, setActiveTab, refreshData }: OverviewProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentInvestment, setRecentInvestment] = useState<any>(null);
  
  // Vérifier le localStorage pour un investissement récent
  useEffect(() => {
    const recentInvestmentData = localStorage.getItem("recentInvestment");
    
    if (recentInvestmentData) {
      // Analyser les données d'investissement stockées
      const investmentData = JSON.parse(recentInvestmentData);
      setRecentInvestment(investmentData);
      
      // Afficher le toast de succès
      toast({
        title: "Investissement réussi !",
        description: `Votre investissement de ${investmentData.amount}€ dans ${investmentData.projectName} a été enregistré.`,
      });
      
      // Mettre à jour la base de données Supabase
      updateSupabaseWithInvestment(investmentData);
    }
  }, []);

  // Fonction pour mettre à jour Supabase avec le nouvel investissement
  async function updateSupabaseWithInvestment(investmentData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("Utilisateur non connecté");
        return;
      }
      
      // Calculer la date de fin (aujourd'hui + durée en mois)
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + investmentData.duration);
      
      // Insérer l'investissement dans la table investments
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          project_id: investmentData.projectId,
          amount: investmentData.amount,
          yield_rate: investmentData.yield,
          duration: investmentData.duration,
          end_date: endDate.toISOString() // Conversion de Date à string ISO
        });
      
      if (investmentError) {
        console.error("Erreur lors de l'enregistrement de l'investissement:", investmentError);
        return;
      }
      
      // Mettre à jour le profil utilisateur
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('investment_total, projects_count, wallet_balance')
        .eq('id', user.id)
        .single();
      
      if (profileFetchError) {
        console.error("Erreur lors de la récupération du profil:", profileFetchError);
        return;
      }
      
      // Calculer les nouvelles valeurs
      const newTotal = (profileData.investment_total || 0) + investmentData.amount;
      const newWalletBalance = (profileData.wallet_balance || 0) - investmentData.amount;
      
      // Vérifier si l'utilisateur a déjà investi dans ce projet
      const { data: existingInvestments } = await supabase
        .from('investments')
        .select('id')
        .eq('user_id', user.id)
        .eq('project_id', investmentData.projectId);
      
      let newCount = profileData.projects_count || 0;
      if (existingInvestments && existingInvestments.length <= 1) {
        // Incrémenter uniquement si c'est le premier investissement de l'utilisateur dans ce projet
        newCount += 1;
      }
      
      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          investment_total: newTotal,
          projects_count: newCount,
          wallet_balance: newWalletBalance >= 0 ? newWalletBalance : 0
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du profil:", updateError);
        return;
      }
      
      // Ajouter une transaction dans wallet_transactions
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          amount: investmentData.amount,
          type: 'investment',
          description: `Investissement dans ${investmentData.projectName}`
        });
      
      if (transactionError) {
        console.error("Erreur lors de l'enregistrement de la transaction:", transactionError);
      }
      
      // Supprimer du localStorage pour éviter de montrer à nouveau
      localStorage.removeItem("recentInvestment");
      
      // Montrer la confirmation d'investissement
      setShowSuccess(true);
      
      // Rafraîchir les données du tableau de bord
      refreshData();
      
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'investissement:", error);
    }
  }

  return (
    <div className="space-y-4">
      {showSuccess && recentInvestment && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4 animate-fade-in">
          <p className="font-medium">Nouvel investissement ajouté avec succès!</p>
          <p className="text-sm">Vous avez investi {recentInvestment.amount}€ dans {recentInvestment.projectName}. Vous pouvez voir les détails dans la section Investissements.</p>
        </div>
      )}
      <DashboardCards userData={userData} />
      <ChartsSection setActiveTab={setActiveTab} />
      <RecentProjects userInvestments={userInvestments} setActiveTab={setActiveTab} />
    </div>
  );
}
