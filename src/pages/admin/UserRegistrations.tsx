
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, UserPlus, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function UserRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchRegistrations();

    // Set up realtime subscriptions
    const channel = supabase
      .channel('profiles-registrations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchRegistrations();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      
      console.log('Fetching all user registrations...');
      
      // Make sure we're fetching ALL profiles without any filters
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching registrations:', error);
        setFetchError(error.message);
        toast.error("Erreur lors du chargement des inscriptions", {
          description: error.message
        });
        throw error;
      }

      console.log('Fetched registrations count:', count);
      console.log('Fetched registrations data:', data);
      
      // Check if we got data but it's empty
      if (data && data.length === 0) {
        console.log('No registrations found in the database');
        toast.info("Aucun utilisateur trouvé dans la base de données");
      } else if (data) {
        console.log(`Successfully fetched ${data.length} user registrations`);
        toast.success(`${data.length} utilisateurs trouvés`);
      }
      
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error in fetchRegistrations:', error);
      setFetchError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter((registration) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (registration.first_name && registration.first_name.toLowerCase().includes(searchLower)) ||
      (registration.last_name && registration.last_name.toLowerCase().includes(searchLower)) ||
      (registration.email && registration.email.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inscriptions Utilisateurs ({registrations.length})</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestion des comptes utilisateur de la plateforme
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center ${isRealtimeConnected ? 'text-green-500' : 'text-gray-400'}`}>
            <span className={`w-2 h-2 mr-1 rounded-full ${isRealtimeConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className="text-xs whitespace-nowrap">Données en temps réel</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRegistrations}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
            <p className="text-sm text-red-700 mt-1">{fetchError}</p>
            <p className="text-sm text-red-700 mt-1">
              Vérifiez la console pour plus de détails et assurez-vous que votre connexion à Supabase est correcte.
            </p>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Rechercher par nom, prénom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center justify-between">
            <span>Liste des utilisateurs ({filteredRegistrations.length})</span>
            <Badge variant={isLoading ? "outline" : "default"} className="ml-2">
              {isLoading ? "Chargement..." : `${filteredRegistrations.length} sur ${registrations.length}`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex space-x-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead>Solde</TableHead>
                    <TableHead>Nb. projets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm ? "Aucune inscription trouvée pour cette recherche" : "Aucune inscription disponible"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>{registration.first_name || '-'}</TableCell>
                        <TableCell>{registration.last_name || '-'}</TableCell>
                        <TableCell>{registration.email || '-'}</TableCell>
                        <TableCell>{registration.phone || '-'}</TableCell>
                        <TableCell>
                          {registration.created_at ? new Date(registration.created_at).toLocaleDateString('fr-FR') : '-'}
                        </TableCell>
                        <TableCell>{registration.wallet_balance ? `${registration.wallet_balance} €` : '0 €'}</TableCell>
                        <TableCell>{registration.projects_count || '0'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
