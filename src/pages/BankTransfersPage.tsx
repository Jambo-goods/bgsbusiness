
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { FileText, Download, RotateCcw, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/utils/formatUtils';

interface BankTransferUserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface BankTransfer {
  id: string;
  user_id: string;
  amount: number;
  status: string; // Using string to handle any status value
  description?: string;
  reference: string;
  created_at: string;
  confirmed_at?: string | null;
  rejected_at?: string | null;
  processed_at?: string | null;
  notes?: string | null;
  processed?: boolean | null;
  user_profile?: BankTransferUserProfile | null;
}

export default function BankTransfersPage() {
  const [bankTransfers, setBankTransfers] = useState<BankTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rawTransfers, setRawTransfers] = useState<any[]>([]);

  useEffect(() => {
    fetchBankTransfers();
    
    // Configuration de l'abonnement en temps réel pour tous les virements
    const channel = supabase
      .channel('bank-transfers-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bank_transfers'
      }, () => {
        fetchBankTransfers();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBankTransfers = async () => {
    try {
      setIsLoading(true);
      console.log("Tentative de récupération de tous les virements bancaires");
      
      // Récupération de tous les virements bancaires sans aucun filtrage
      const { data: transfersData, error: transfersError } = await supabase
        .from('bank_transfers')
        .select('*');
        
      if (transfersError) {
        console.error('Erreur SQL:', transfersError);
        throw transfersError;
      }
      
      console.log("Données brutes des virements reçues:", transfersData);
      setRawTransfers(transfersData || []);
      console.log("Nombre total de virements récupérés de la base de données:", transfersData?.length || 0);
      
      // Récupérer les profils des utilisateurs
      if (transfersData && transfersData.length > 0) {
        const userIds = [...new Set(transfersData.map(transfer => transfer.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Erreur lors de la récupération des profils:', profilesError);
        }
        
        console.log("Données des profils reçues:", profilesData);
        
        // Créer un dictionnaire des profils par ID
        const profilesById: Record<string, BankTransferUserProfile> = {};
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesById[profile.id] = {
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email
            };
          });
        }
        
        // Formater les transferts avec les informations de profil
        const formattedTransfers: BankTransfer[] = transfersData.map(transfer => ({
          id: transfer.id,
          user_id: transfer.user_id,
          amount: transfer.amount || 0,
          status: transfer.status || 'pending',
          description: transfer.notes || '',
          reference: transfer.reference || 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          created_at: transfer.confirmed_at || new Date().toISOString(),
          confirmed_at: transfer.confirmed_at,
          rejected_at: null,
          processed_at: transfer.processed_at,
          notes: transfer.notes,
          processed: transfer.processed,
          user_profile: profilesById[transfer.user_id] || null
        }));
        
        console.log("Tous les virements formatés:", formattedTransfers);
        console.log("Nombre total de virements formatés:", formattedTransfers.length);
        console.log("IDs des virements:", formattedTransfers.map(t => t.id).join(', '));
        console.log("Statuts des virements:", formattedTransfers.map(t => t.status).join(', '));
        setBankTransfers(formattedTransfers);
      } else {
        console.log("Aucun virement trouvé dans la base de données");
        setBankTransfers([]);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des virements bancaires:', err);
      toast.error('Impossible de charger les virements bancaires');
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
    (transfer.description && transfer.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (transfer.user_profile?.email && transfer.user_profile.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    // Normalize the status for display
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus.includes('pend') || normalizedStatus === 'en attente') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">En attente</span>;
    } else if (normalizedStatus.includes('compl') || normalizedStatus.includes('reçu') || normalizedStatus.includes('rece') || normalizedStatus === 'completed') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Reçu</span>;
    } else if (normalizedStatus.includes('reject') || normalizedStatus === 'rejeté') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Rejeté</span>;
    } else {
      // Default badge for any other status
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  // Formater le nom d'utilisateur
  const formatUserName = (profile?: BankTransferUserProfile | null) => {
    if (!profile) return "Utilisateur inconnu";
    const firstName = profile.first_name || "";
    const lastName = profile.last_name || "";
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return profile.email || "Utilisateur inconnu";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Tous les Virements Bancaires | BGS Invest</title>
        <meta name="description" content="Gestion de tous les virements bancaires avec BGS Invest" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-bgs-blue">Tous les Virements Bancaires</h1>
                <p className="text-gray-600 mt-1">Consultez tous les virements bancaires dans le système</p>
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
                <CardTitle>Tous les virements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par référence, description ou email..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" title="Filtres">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Résumé des données brutes pour débogage */}
                <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <h3 className="text-sm font-semibold mb-2">Informations de débogage</h3>
                  <p className="text-xs text-gray-600">Nombre de virements bruts: {rawTransfers.length}</p>
                  <p className="text-xs text-gray-600">Nombre de virements formatés: {bankTransfers.length}</p>
                  <p className="text-xs text-gray-600">Nombre de virements filtrés: {filteredTransfers.length}</p>
                  <p className="text-xs text-gray-600">IDs des virements bruts: {rawTransfers.map(t => t.id).join(', ')}</p>
                  <p className="text-xs text-gray-600">Statuts des virements bruts: {rawTransfers.map(t => t.status).join(', ')}</p>
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
                          <th className="px-5 py-3 text-left font-medium">Utilisateur</th>
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
                            <td className="px-5 py-4">
                              <div className="line-clamp-1">
                                <span className="font-medium">{formatUserName(transfer.user_profile)}</span>
                                {transfer.user_profile?.email && (
                                  <span className="text-xs text-gray-500 block">{transfer.user_profile.email}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4">{formatDate(transfer.created_at)}</td>
                            <td className="px-5 py-4 font-medium">{formatCurrency(transfer.amount)}</td>
                            <td className="px-5 py-4">
                              <span className="line-clamp-1">{transfer.description || '-'}</span>
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
                      Aucun virement bancaire ne correspond à votre recherche.
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
