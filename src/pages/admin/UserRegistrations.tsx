
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
import { Search, UserPlus, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function UserRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

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
        console.log('Realtime status:', status);
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Fetched registrations:', data);
      setRegistrations(data || []);
      
      if (data?.length === 0) {
        toast.info("Aucun utilisateur trouvé dans la base de données");
      } else {
        toast.success(`${data?.length || 0} utilisateurs trouvés`);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error("Erreur lors du chargement des inscriptions");
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inscriptions Utilisateurs ({registrations.length})</h1>
        <div className="flex items-center">
          <div className={`flex items-center mr-4 ${isRealtimeConnected ? 'text-green-500' : 'text-gray-400'}`}>
            <span className={`w-2 h-2 mr-1 rounded-full ${isRealtimeConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className="text-xs">Données en temps réel</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRegistrations}
            className="ml-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </Button>
        </div>
      </div>

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
          <CardTitle className="text-xl">Liste des utilisateurs ({filteredRegistrations.length})</CardTitle>
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
