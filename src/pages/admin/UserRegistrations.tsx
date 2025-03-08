
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
import { Search, UserPlus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  wallet_balance: number | null;
  projects_count: number | null;
};

export default function UserRegistrations() {
  const [registrations, setRegistrations] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

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
    } catch (error) {
      console.error('Error fetching registrations:', error);
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

  const handleUserSelect = (user: Profile) => {
    setSelectedUser(user);
  };

  const handleCloseUserDetail = () => {
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inscriptions Utilisateurs</h1>
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
          >
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

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* User List */}
        <div className={`md:col-span-${selectedUser ? '2' : '3'}`}>
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
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
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
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleUserSelect(registration)}
                              >
                                Voir
                              </Button>
                            </TableCell>
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

        {/* User Detail */}
        {selectedUser && (
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Détail de l'utilisateur</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCloseUserDetail}>
                  <X size={18} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto flex items-center justify-center text-gray-500 text-2xl font-bold">
                      {selectedUser.first_name?.[0] || ''}{selectedUser.last_name?.[0] || ''}
                    </div>
                    <h2 className="text-xl font-bold mt-2">{selectedUser.first_name} {selectedUser.last_name}</h2>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Solde</p>
                      <p className="text-lg font-bold">{selectedUser.wallet_balance || 0} €</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Projets</p>
                      <p className="text-lg font-bold">{selectedUser.projects_count || 0}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Téléphone:</span>
                      <span>{selectedUser.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Date d'inscription:</span>
                      <span>{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('fr-FR') : '-'}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button className="w-full" variant="outline">
                      Envoyer un message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
