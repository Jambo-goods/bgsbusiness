
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  fetchInvestmentDetails, 
  fetchTransactionHistory 
} from './utils/fetchInvestmentData';
import GeneralInformationCard from './components/GeneralInformationCard';
import TransactionHistoryCard from './components/TransactionHistoryCard';
import ContactActionsCard from './components/ContactActionsCard';
import InvestmentSummaryCards from './components/InvestmentSummaryCards';
import ProjectUpdatesCard from './components/ProjectUpdatesCard';
import { Investment, Payment } from './types/investment';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardLayout from '@/layouts/DashboardLayout';
import { toast } from 'sonner';

const InvestmentTrackingPage: React.FC = () => {
  const { investmentId } = useParams<{ investmentId: string }>();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvestmentData = async () => {
      if (!investmentId) {
        setError('Aucun identifiant d\'investissement fourni');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const investmentData = await fetchInvestmentDetails(investmentId);
        
        if (investmentData) {
          console.log('Données d\'investissement récupérées:', investmentData);
          
          // Fetch payments data for this investment
          const paymentsData = await fetchTransactionHistory(investmentData.user_id);
          
          // Filter payments related to this investment
          const investmentPayments = paymentsData
            .filter(payment => payment.investment_id === investmentId)
            .map(payment => ({
              id: payment.id,
              amount: payment.amount,
              date: payment.created_at,
              status: payment.status as 'pending' | 'completed' | 'failed' | 'paid',
              description: payment.description || 'Paiement',
              userId: payment.user_id,
              investmentId: investmentId
            }));
          
          // Add payments to the investment data
          setInvestment({
            ...investmentData,
            payments: investmentPayments as Payment[]
          });
        } else {
          setError('Investissement non trouvé');
        }
      } catch (err: any) {
        console.error('Erreur lors de la récupération des données d\'investissement:', err);
        setError(err.message || 'Une erreur est survenue');
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvestmentData();
  }, [investmentId]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-1/3 mb-6" />
          <Skeleton className="h-24 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-60" />
        </div>
      );
    }

    if (error || !investment) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="font-medium">Erreur: {error || 'Investissement non trouvé'}</p>
            <p className="text-sm mt-1">Veuillez réessayer plus tard ou contacter le support.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
          <h1 className="text-2xl font-bold text-blue-800 mb-2">
            Investissement dans {investment.projects?.name || 'Projet'}
          </h1>
          <p className="text-blue-600">
            Suivez les performances et les paiements de votre investissement
          </p>
        </div>

        <InvestmentSummaryCards investmentData={investment} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GeneralInformationCard investment={investment} />
            {investment && (
              <TransactionHistoryCard 
                investmentId={investment.id} 
                userId={investment.user_id}
              />
            )}
            {investment && (
              <ProjectUpdatesCard 
                projectId={investment.project_id}
              />
            )}
          </div>
          
          <div className="space-y-6">
            {investment && (
              <ContactActionsCard 
                investmentId={investment.id}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
};

export default InvestmentTrackingPage;
