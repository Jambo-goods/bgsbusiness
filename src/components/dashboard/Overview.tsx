
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
      try {
        // Analyser les données d'investissement stockées
        const investmentData = JSON.parse(recentInvestmentData);
        
        // Vérifier si l'investissement est récent (moins de 10 minutes)
        const investmentTime = new Date(investmentData.timestamp || Date.now());
        const currentTime = new Date();
        const timeDifference = currentTime.getTime() - investmentTime.getTime();
        const minutesDifference = timeDifference / (1000 * 60);
        
        // Ne montrer l'investissement que s'il a moins de 10 minutes
        if (minutesDifference < 10) {
          setRecentInvestment(investmentData);
          
          // Afficher le toast de succès
          toast({
            title: "Investissement réussi !",
            description: `Votre investissement de ${investmentData.amount}€ dans ${investmentData.projectName} a été enregistré.`,
          });
          
          // Mettre à jour la base de données Supabase
          updateSupabaseWithInvestment(investmentData);
          
          // Montrer la confirmation d'investissement
          setShowSuccess(true);
        } else {
          // Supprimer du localStorage car trop ancien
          localStorage.removeItem("recentInvestment");
        }
      } catch (error) {
        console.error("Erreur lors de l'analyse des données d'investissement:", error);
        localStorage.removeItem("recentInvestment");
      }
    }
  }, []);

  // Fonction pour mettre à jour Supabase avec le nouvel investissement
  async function updateSupabaseWithInvestment(investmentData: any) {
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        console.error("Utilisateur non connecté");
        return;
      }
      
      // Vérifier si l'investissement existe déjà
      const { data: existingInvestment, error: checkError } = await supabase
        .from('investments')
        .select('id')
        .eq('user_id', userId)
        .eq('project_id', investmentData.projectId)
        .eq('amount', investmentData.amount)
        .order('date', { ascending: false })
        .limit(1);
      
      if (checkError) {
        console.error("Erreur lors de la vérification de l'investissement:", checkError);
      } else if (existingInvestment && existingInvestment.length > 0) {
        // L'investissement existe déjà, pas besoin de le recréer
        console.log("Investissement déjà enregistré, pas besoin de le recréer");
        
        // Supprimer du localStorage pour éviter de montrer à nouveau
        localStorage.removeItem("recentInvestment");
        
        // Rafraîchir les données du tableau de bord
        refreshData();
        
        return;
      }
      
      // Calculer la date de fin (durée en mois à partir de maintenant)
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + investmentData.duration);
      
      // Insérer l'investissement dans la table investments s'il n'existe pas déjà
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          project_id: investmentData.projectId,
          amount: investmentData.amount,
          yield_rate: investmentData.yield,
          duration: investmentData.duration,
          end_date: endDate.toISOString(),
          date: new Date().toISOString()
        });
      
      if (investmentError) {
        console.error("Erreur lors de l'enregistrement de l'investissement:", investmentError);
        return;
      }
      
      // Mettre à jour le profil utilisateur
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('investment_total, projects_count, wallet_balance')
        .eq('id', userId)
        .single();
      
      if (profileFetchError) {
        console.error("Erreur lors de la récupération du profil:", profileFetchError);
        return;
      }
      
      // Calculer les nouvelles valeurs
      const newTotal = (profileData.investment_total || 0) + investmentData.amount;
      const newBalance = (profileData.wallet_balance || 0) - investmentData.amount;
      
      // Vérifier si l'utilisateur a déjà investi dans ce projet
      const { data: existingInvestments } = await supabase
        .from('investments')
        .select('id')
        .eq('user_id', userId)
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
          wallet_balance: newBalance >= 0 ? newBalance : 0
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du profil:", updateError);
        return;
      }
      
      // Créer une transaction pour l'investissement
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: -investmentData.amount,
          type: 'investment',
          description: `Investissement dans ${investmentData.projectName}`
        });
      
      if (transactionError) {
        console.error("Erreur lors de la création de la transaction:", transactionError);
      }
      
      // Supprimer du localStorage pour éviter de montrer à nouveau
      localStorage.removeItem("recentInvestment");
      
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
