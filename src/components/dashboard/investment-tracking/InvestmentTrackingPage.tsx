
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInvestmentTracking } from './hooks/useInvestmentTracking';
import GeneralInformationCard from './components/GeneralInformationCard';
import TransactionHistoryCard from './components/TransactionHistoryCard';
import ProjectUpdatesCard from './components/ProjectUpdatesCard';
import ContactActionsCard from './components/ContactActionsCard';
import InvestmentSummaryCards from './components/InvestmentSummaryCards';
import { useScheduledPayments } from './hooks/useScheduledPayments';

const InvestmentTrackingPage: React.FC = () => {
  const { investmentId } = useParams<{ investmentId: string }>();
  
  // Ensure investmentId is not undefined
  if (!investmentId) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Erreur : Identifiant d'investissement manquant</div>
        <Button variant="outline" asChild>
          <Link to="/dashboard/investments">Retour aux investissements</Link>
        </Button>
      </div>
    );
  }

  const { 
    investment, 
    project, 
    isLoading, 
    error,
    reloadInvestment
  } = useInvestmentTracking(investmentId);
  
  const {
    scheduledPayments,
    isLoading: paymentsLoading,
    error: paymentsError
  } = useScheduledPayments({
    projectId: project?.id || '',
    investmentId
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 w-2/3 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !investment || !project) {
    return (
      <div className="container py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h3 className="font-semibold text-lg mb-2">Erreur lors du chargement des données</h3>
          <p>{error || "Impossible de trouver les détails de l'investissement demandé."}</p>
          <div className="mt-4">
            <Button variant="outline" asChild className="mr-2">
              <Link to="/dashboard/investments">Retour aux investissements</Link>
            </Button>
            <Button variant="secondary" onClick={reloadInvestment}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/dashboard/investments" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux investissements
          </Link>
        </Button>
        <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
        <p className="text-muted-foreground">{project.company_name} - Investissement du {new Date(investment.date).toLocaleDateString('fr-FR')}</p>
      </div>

      <div className="space-y-6">
        <InvestmentSummaryCards 
          investment={investment} 
          project={project} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GeneralInformationCard 
              investment={investment} 
              project={project} 
            />
            
            <TransactionHistoryCard 
              investmentId={investmentId} 
              userId={investment.user_id} 
              projectId={project.id} 
            />
          </div>
          
          <div className="space-y-6">
            <ProjectUpdatesCard 
              projectId={project.id} 
            />
            
            <ContactActionsCard 
              investmentId={investmentId} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentTrackingPage;
