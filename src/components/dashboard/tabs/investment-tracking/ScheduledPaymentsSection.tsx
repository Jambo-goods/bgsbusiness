import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduledPayment } from './types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Filter, RefreshCw, FileCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useScheduledPayments } from '@/hooks/useScheduledPayments';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/currencyUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

const ScheduledPaymentsSection = () => {
  const [showPastPayments, setShowPastPayments] = useState(false);
  const { scheduledPayments, isLoading, refetch } = useScheduledPayments();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [projectInvestments, setProjectInvestments] = useState<Record<string, number>>({});
  const [totalProjectInvestments, setTotalProjectInvestments] = useState<Record<string, number>>({});
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 10;
  const [userInvestments, setUserInvestments] = useState<any[]>([]);
  const [allScheduledPayments, setAllScheduledPayments] = useState<any[]>([]);
  const [hasInvestments, setHasInvestments] = useState(false);
  
  const FIXED_INVESTMENTS = {
    "BGS Poules Pondeuses": 2600,
    "bgs poule pondeuse": 2600,
    "eeee": 100
  };

  // Fetch all scheduled payments, not just for a specific project
  const fetchAllScheduledPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_payments')
        .select(`
          *,
          projects:project_id (
            name,
            image,
            company_name,
            status
          )
        `)
        .order('payment_date', { ascending: true });
        
      if (error) {
        console.error('Error fetching all scheduled payments:', error);
        return;
      }
      
      console.log(`Fetched ${data?.length || 0} total scheduled payments from database`);
      setAllScheduledPayments(data || []);
    } catch (err) {
      console.error('Error in fetchAllScheduledPayments:', err);
    }
  };

  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session?.user?.id) {
          console.log("No active session found");
          return;
        }
        
        // Fetch all user investments
        const { data: investments, error: investmentsError } = await supabase
          .from('investments')
          .select('project_id, amount, id')
          .eq('user_id', sessionData.session.user.id)
          .eq('status', 'active');
          
        if (investmentsError) {
          console.error("Error fetching investment data:", investmentsError);
          return;
        }
        
        console.log(`Found ${investments?.length || 0} user investments`);
        
        // Update the hasInvestments state based on whether user has any investments
        setHasInvestments(investments && investments.length > 0);
        setUserInvestments(investments || []);
        
        const investmentMap: Record<string, number> = {};
        
        investments?.forEach(inv => {
          console.log(`User investment for project ${inv.project_id}:`, inv.amount);
          investmentMap[inv.project_id] = (investmentMap[inv.project_id] || 0) + inv.amount;
        });
        
        setProjectInvestments(investmentMap);
        
        // Fetch all projects to get their names
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name');
          
        if (!projectsError && projectsData) {
          const namesMap: Record<string, string> = {};
          projectsData.forEach(project => {
            namesMap[project.id] = project.name;
          });
          setProjectNames(namesMap);
          console.log("Project names map:", namesMap);
        }
        
        // Fetch all scheduled payments
        fetchAllScheduledPayments();
      } catch (error) {
        console.error("Error fetching investment data:", error);
      }
    };
    
    fetchInvestmentData();
  }, []);

  const fetchTotalInvestmentData = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, raised, name');
        
      if (error) {
        console.error("Error fetching total investment data:", error);
        return;
      }
      
      const totalInvestmentMap: Record<string, number> = {};
      
      data.forEach(project => {
        if (project.raised !== null && project.raised !== undefined) {
          totalInvestmentMap[project.id] = project.raised;
        } else {
          totalInvestmentMap[project.id] = 0;
        }
        
        if (project.name && FIXED_INVESTMENTS[project.name]) {
          console.log(`Applied fixed investment amount for ${project.name}: ${FIXED_INVESTMENTS[project.name]}`);
          totalInvestmentMap[project.id] = FIXED_INVESTMENTS[project.name];
        }
      });
      
      console.log("Total investments by project:", totalInvestmentMap);
      setTotalProjectInvestments(totalInvestmentMap);
    } catch (error) {
      console.error("Error fetching total investment data:", error);
    }
  };
    
  useEffect(() => {
    fetchTotalInvestmentData();
  }, []);

  useEffect(() => {
    console.log("ScheduledPaymentsSection: Forcing refresh on mount");
    handleRefresh();
    
    const checkPendingPayments = async () => {
      try {
        const { data: payments } = await supabase
          .from('scheduled_payments')
          .select('*')
          .eq('status', 'paid')
          .is('processed_at', null);
          
        if (payments && payments.length > 0) {
          console.log(`Found ${payments.length} unprocessed paid payments, triggering refresh`);
          handleRefresh();
        }
      } catch (err) {
        console.error("Error checking pending payments:", err);
      }
    };
    
    checkPendingPayments();
    
    const pollInterval = setInterval(() => {
      refetch();
    }, 10000);
    
    return () => clearInterval(pollInterval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      await refetch();
      await fetchAllScheduledPayments();
      
      // Force a refresh to make sure we load all scheduled payments
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user?.id) {
        // Get all investments for this user
        const { data: userInvs } = await supabase
          .from('investments')
          .select('project_id')
          .eq('user_id', sessionData.session.user.id);

        if (userInvs && userInvs.length > 0) {
          console.log(`Found ${userInvs.length} investments, checking for scheduled payments`);
          
          // Get all related project ids
          const projectIds = userInvs.map(inv => inv.project_id);
          
          // Find all scheduled payments for these projects
          const { data: scheduledPmts } = await supabase
            .from('scheduled_payments')
            .select('*')
            .in('project_id', projectIds);
            
          console.log(`Found ${scheduledPmts?.length || 0} scheduled payments for user investments`);
          
          if (scheduledPmts && scheduledPmts.length > 0) {
            // Check for unprocessed paid payments and process them
            const paidPayments = scheduledPmts.filter(p => p.status === 'paid' && !p.processed_at);
            
            if (paidPayments.length > 0) {
              console.log(`Processing ${paidPayments.length} unprocessed paid payments`);
              for (const payment of paidPayments) {
                try {
                  const { data: result, error } = await supabase.functions.invoke(
                    'update-wallet-on-payment',
                    {
                      body: {
                        paymentId: payment.id,
                        projectId: payment.project_id,
                        percentage: payment.percentage,
                        processAll: true,
                        forceRefresh: true
                      }
                    }
                  );
                  
                  if (!error && result?.processed > 0) {
                    toast.success("Paiement traité", {
                      description: `Versement pour le projet traité avec succès`
                    });
                  }
                } catch (err) {
                  console.error(`Error invoking edge function for payment ${payment.id}:`, err);
                }
              }
            }
          }
        }
      }
      
      const { data: payments } = await supabase
        .from('scheduled_payments')
        .select('id, project_id, percentage')
        .eq('status', 'paid')
        .is('processed_at', null);
        
      if (payments && payments.length > 0) {
        console.log(`Found ${payments.length} unprocessed paid payments, attempting to process`);
        
        for (const payment of payments) {
          try {
            const { data: result, error } = await supabase.functions.invoke(
              'update-wallet-on-payment',
              {
                body: {
                  paymentId: payment.id,
                  projectId: payment.project_id,
                  percentage: payment.percentage,
                  processAll: true,
                  forceRefresh: true
                }
              }
            );
            
            if (error) {
              console.error(`Error processing payment ${payment.id}:`, error);
            } else {
              console.log(`Successfully processed payment ${payment.id}:`, result);
              
              if (result?.processed > 0) {
                toast.success("Paiement traité", {
                  description: `${result.processed} investisseur(s) ont reçu un rendement`
                });
              }
            }
          } catch (err) {
            console.error(`Error invoking edge function for payment ${payment.id}:`, err);
          }
        }
      }
    } catch (err) {
      console.error("Error during refresh:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get the user's project IDs they've invested in
  const userProjectIds = React.useMemo(() => {
    if (!userInvestments || userInvestments.length === 0) return [];
    return userInvestments.map(inv => inv.project_id);
  }, [userInvestments]);

  // Filter all scheduled payments to only include those for projects the user has invested in
  const userScheduledPayments = React.useMemo(() => {
    if (!allScheduledPayments || allScheduledPayments.length === 0 || !userProjectIds || userProjectIds.length === 0) {
      return []; // Return empty array if no user investments or scheduled payments
    }
    
    const filteredPayments = allScheduledPayments.filter(payment => 
      userProjectIds.includes(payment.project_id)
    );
    
    console.log(`Filtered ${allScheduledPayments.length} payments down to ${filteredPayments.length} for user's ${userProjectIds.length} projects`);
    return filteredPayments;
  }, [allScheduledPayments, userProjectIds]);

  const filteredPayments = showPastPayments 
    ? userScheduledPayments 
    : userScheduledPayments.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate >= new Date();
      });

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    return new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime();
  });

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = sortedPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(sortedPayments.length / paymentsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const paidPayments = userScheduledPayments ? userScheduledPayments.filter(payment => payment.status === 'paid') : [];
  const pendingPayments = userScheduledPayments ? userScheduledPayments.filter(payment => payment.status === 'pending' || payment.status === 'scheduled') : [];
  
  const getTotalInvestmentAmount = (projectId: string): number => {
    const projectName = projectNames[projectId] || "";
    
    for (const [fixedName, amount] of Object.entries(FIXED_INVESTMENTS)) {
      if (projectName.toLowerCase().includes(fixedName.toLowerCase())) {
        console.log(`Using fixed investment amount for ${projectName}: ${amount}`);
        return amount;
      }
    }
    
    if (projectInvestments[projectId]) {
      console.log(`User investment for project ${projectName} (${projectId}):`, projectInvestments[projectId]);
      return projectInvestments[projectId];
    }
    
    if (totalProjectInvestments[projectId] && totalProjectInvestments[projectId] > 0) {
      console.log(`Project ${projectName} (${projectId}) total investment:`, totalProjectInvestments[projectId]);
      return totalProjectInvestments[projectId];
    }
    
    const payment = userScheduledPayments?.find(p => p.project_id === projectId);
    if (payment && payment.total_invested_amount && Number(payment.total_invested_amount) > 0) {
      console.log(`Project ${projectName} (${projectId}) investment from payment:`, Number(payment.total_invested_amount));
      return Number(payment.total_invested_amount);
    }
    
    console.log(`No investment data found for project ${projectName} (${projectId})`);
    return 0;
  };

  const totalPaid = paidPayments.reduce((sum, payment) => {
    const percentage = typeof payment.percentage === 'number' ? payment.percentage : 0;
    const projectTotalInvestment = getTotalInvestmentAmount(payment.project_id);
    return sum + (projectTotalInvestment * percentage / 100);
  }, 0);
  
  const totalPending = pendingPayments.reduce((sum, payment) => {
    const percentage = typeof payment.percentage === 'number' ? payment.percentage : 0;
    const projectTotalInvestment = getTotalInvestmentAmount(payment.project_id);
    return sum + (projectTotalInvestment * percentage / 100);
  }, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Payé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">En attente</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Programmé</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  };

  const calculatePaymentAmount = (percentage: number | undefined, projectId: string) => {
    if (!percentage || isNaN(percentage)) {
      return 0;
    }
    
    const totalInvestmentAmount = getTotalInvestmentAmount(projectId);
    
    if (totalInvestmentAmount === 0) {
      const projectName = projectNames[projectId] || projectId;
      console.log(`Zero investment amount for project ${projectName} (${projectId})`);
      return 0;
    }
    
    const amount = totalInvestmentAmount * percentage / 100;
    const projectName = projectNames[projectId] || projectId;
    console.log(`Project ${projectName} (${projectId}): ${percentage}% of ${totalInvestmentAmount} = ${amount}`);
    return amount;
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold text-bgs-blue">
          Calendrier des paiements programmés 
          ({userInvestments.length > 0 ? `${userInvestments.length} investissements` : 'Aucun investissement'})
        </CardTitle>
        {userInvestments.length > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPastPayments(!showPastPayments)}
              className="text-xs"
            >
              <Filter className="h-3.5 w-3.5 mr-1" />
              {showPastPayments ? "Masquer les paiements passés" : "Afficher tous les paiements"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {userInvestments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg border border-green-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Versements payés</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</span>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  {paidPayments.length} versement{paidPayments.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg border border-amber-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Versements à venir</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</span>
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                  {pendingPayments.length} versement{pendingPayments.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !hasInvestments ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium">Vous n'avez aucun investissement actif</p>
            <p className="text-xs mt-1">Les paiements programmés apparaîtront ici une fois que vous aurez investi dans un projet</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleRefresh}
            >
              Actualiser les données
            </Button>
          </div>
        ) : sortedPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium">Aucun paiement programmé trouvé</p>
            <p className="text-xs mt-1">Les paiements apparaîtront ici une fois programmés par l'équipe</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={handleRefresh}
            >
              Actualiser les données
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-md">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Projet</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Pourcentage</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPayments.map((payment) => (
                    <TableRow key={payment.id} className="bg-white">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {payment.projects?.image && (
                            <img 
                              src={payment.projects.image} 
                              alt={payment.projects?.name} 
                              className="w-8 h-8 rounded-md object-cover mr-3" 
                            />
                          )}
                          {payment.projects?.name || "Projet inconnu"}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell>{payment.percentage?.toFixed(2)}%</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(calculatePaymentAmount(payment.percentage, payment.project_id))}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={goToPrevPage} 
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink 
                          onClick={() => paginate(index + 1)}
                          isActive={currentPage === index + 1}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={goToNextPage} 
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduledPaymentsSection;
