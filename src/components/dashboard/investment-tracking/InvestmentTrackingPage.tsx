
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
import { Investment } from './types/investment';
import { Skeleton } from '@/components/ui/skeleton';

const InvestmentTrackingPage: React.FC = () => {
  const { investmentId } = useParams<{ investmentId: string }>();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvestmentData = async () => {
      if (!investmentId) {
        setError('No investment ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const investmentData = await fetchInvestmentDetails(investmentId);
        
        if (investmentData) {
          console.log('Fetched investment details:', investmentData);
          setInvestment(investmentData);
        } else {
          setError('Investment not found');
        }
      } catch (err: any) {
        console.error('Error fetching investment data:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvestmentData();
  }, [investmentId]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 col-span-2" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-60" />
      </div>
    );
  }

  if (error || !investment) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium">Error: {error || 'Investment not found'}</p>
          <p className="text-sm mt-1">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Investment in {investment.projects?.name || 'Project'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <GeneralInformationCard investment={investment} />
          <TransactionHistoryCard 
            investmentId={investment.id} 
            userId={investment.user_id}
          />
          <ProjectUpdatesCard project_id={investment.project_id} />
        </div>
        
        <div className="space-y-6">
          <InvestmentSummaryCards 
            amount={investment.amount}
            yieldRate={investment.projects?.yield || 0}
            remainingDuration={investment.remainingDuration || 0}
            startDate={investment.date}
          />
          <ContactActionsCard investment_id={investment.id} />
        </div>
      </div>
    </div>
  );
};

export default InvestmentTrackingPage;
