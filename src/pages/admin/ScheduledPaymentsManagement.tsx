
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { logAdminAction } from '@/services/adminAuthService';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  RefreshCw, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ScheduledPaymentsManagement() {
  const { adminUser } = useAdmin();
  const [payments, setPayments] = useState<any[]>([]);
  const [projectsData, setProjectsData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('scheduled_payments')
        .select('*')
        .order('payment_date', { ascending: true });

      if (error) throw error;

      // Get all project IDs
      const projectIds = Array.from(new Set(data?.map(p => p.project_id) || []));
      
      // Fetch project data
      if (projectIds.length > 0) {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, company_name')
          .in('id', projectIds);
          
        if (projectsError) throw projectsError;
        
        const projectsMap: Record<string, any> = {};
        projectsData?.forEach(project => {
          projectsMap[project.id] = project;
        });
        
        setProjectsData(projectsMap);
      }

      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching scheduled payments:', error);
      toast.error('Erreur lors du chargement des paiements programmés');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleMarkAsProcessed = async (paymentId: string) => {
    if (!adminUser) return;
    
    if (!window.confirm('Êtes-vous sûr de vouloir marquer ce paiement comme traité ?')) {
      return;
    }
    
    try {
      setIsUpdating(paymentId);
      
      const { data: payment, error: getError } = await supabase
        .from('scheduled_payments')
        .select('*')
        .eq('id', paymentId)
        .single();
        
      if (getError) throw getError;
      
      const { error: updateError } = await supabase
        .from('scheduled_payments')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString()
        })
        .eq('id', paymentId);
        
      if (updateError) throw updateError;
      
      // Log admin action
      await logAdminAction(
        adminUser.id,
        'payment_management',
        `Paiement programmé marqué comme traité: ${payment.total_scheduled_amount}€ pour le projet ${projectsData[payment.project_id]?.name || payment.project_id}`,
        null,
        payment.project_id,
        payment.total_scheduled_amount
      );
      
      toast.success('Paiement marqué comme traité');
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Erreur lors de la mise à jour du statut du paiement');
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </span>;
      case 'processed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Traité
          </span>;
      default:
        return <span>{status}</span>;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    const projectName = projectsData[payment.project_id]?.name?.toLowerCase() || '';
    const companyName = projectsData[payment.project_id]?.company_name?.toLowerCase() || '';
    
    return projectName.includes(searchLower) || companyName.includes(searchLower);
  });

  const handleRefresh = async () => {
    await fetchPayments();
    toast.success('Paiements programmés actualisés');
  };

  return (
    <>
      <Helmet>
        <title>Gestion des Paiements Programmés | BGS Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Paiements Programmés</h1>
          <Button 
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
          <div className="flex mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un projet..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgs-blue"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">Aucun paiement programmé trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projet</TableHead>
                    <TableHead>Date de paiement</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Investisseurs</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de traitement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {projectsData[payment.project_id]?.name || 'Projet inconnu'}
                        <div className="text-xs text-gray-500">
                          {projectsData[payment.project_id]?.company_name || ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.payment_date 
                          ? format(new Date(payment.payment_date), 'dd MMMM yyyy', { locale: fr })
                          : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {payment.total_scheduled_amount 
                          ? `${parseFloat(payment.total_scheduled_amount).toLocaleString('fr-FR')} €`
                          : '0 €'}
                      </TableCell>
                      <TableCell>{payment.investors_count || 0}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {payment.processed_at 
                          ? format(new Date(payment.processed_at), 'dd MMMM yyyy', { locale: fr })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {payment.status === 'pending' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-green-600 hover:text-green-800 hover:bg-green-50"
                            onClick={() => handleMarkAsProcessed(payment.id)}
                            disabled={isUpdating === payment.id}
                          >
                            {isUpdating === payment.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            <span>Marquer comme traité</span>
                          </Button>
                        ) : (
                          <div className="flex items-center text-green-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="text-xs">Paiement effectué</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
