
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUserSession } from '@/hooks/dashboard/useUserSession';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { FileText, Download, RotateCcw, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Fonction de formatage de la monnaie
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};

// Fonction de formatage de date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

interface BankTransfer {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  description: string;
  reference: string;
  created_at: string;
  confirmed_at?: string;
  rejected_at?: string;
  user_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function BankTransfersPage() {
  const [bankTransfers, setBankTransfers] = useState<BankTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { userId } = useUserSession();

  useEffect(() => {
    if (userId) {
      fetchBankTransfers();
      
      // Mise en place d'un abonnement en temps réel
      const channel = supabase
        .channel('bank-transfers-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'bank_transfers',
          filter: `user_id=eq.${userId}`
        }, () => {
          fetchBankTransfers();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const fetchBankTransfers = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // Récupération des virements bancaires avec les informations de profil
      const { data, error } = await supabase
        .from('bank_transfers')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const formattedTransfers: BankTransfer[] = data.map(transfer => ({
          ...transfer,
          user_profile: transfer.profiles as any,
          description: transfer.description || '',
          reference: transfer.reference || '',
          status: transfer.status as 'pending' | 'completed' | 'rejected'
        }));
        
        setBankTransfers(formattedTransfers);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des virements bancaires:', err);
      toast.error('Impossible de charger vos virements bancaires');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBankTransfers();
    toast.success('Données actualisées');
  };

  // Filtrer les virements en fonction du terme de recherche
  const filteredTransfers = bankTransfers.filter(transfer => 
    transfer.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">En attente</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Complété</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Rejeté</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Virements Bancaires | BGS Invest</title>
        <meta name="description" content="Suivez vos virements bancaires avec BGS Invest" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-bgs-blue">Virements Bancaires</h1>
                <p className="text-gray-600 mt-1">Consultez l'historique de vos virements bancaires</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
                <Button variant="default" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
            
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle>Vos virements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par référence ou description..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" title="Filtres">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <LoadingSpinner size="lg" color="blue" />
                  </div>
                ) : filteredTransfers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-gray-600 text-sm">
                        <tr>
                          <th className="px-5 py-3 text-left font-medium">Référence</th>
                          <th className="px-5 py-3 text-left font-medium">Date</th>
                          <th className="px-5 py-3 text-left font-medium">Montant</th>
                          <th className="px-5 py-3 text-left font-medium">Description</th>
                          <th className="px-5 py-3 text-left font-medium">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredTransfers.map((transfer) => (
                          <tr key={transfer.id} className="text-gray-700 hover:bg-gray-50">
                            <td className="px-5 py-4">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{transfer.reference}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">{formatDate(transfer.created_at)}</td>
                            <td className="px-5 py-4 font-medium">{formatCurrency(transfer.amount)}</td>
                            <td className="px-5 py-4">
                              <span className="line-clamp-1">{transfer.description}</span>
                            </td>
                            <td className="px-5 py-4">
                              {getStatusBadge(transfer.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="mb-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun virement trouvé</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Vous n'avez pas encore effectué de virements bancaires ou aucun virement ne correspond à votre recherche.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
