
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [hasError, setHasError] = useState(false);
  const [realTimeStatus, setRealTimeStatus] = useState('connecting');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
    
    // Set up real-time subscription for profiles with better error handling
    const profilesChannel = supabase
      .channel('admin_profiles_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        console.log('Profiles data changed, refreshing users...', payload);
        fetchUsers();
        toast.info("Mise à jour détectée", {
          description: "Les données utilisateurs ont été mises à jour."
        });
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to profiles table');
          setRealTimeStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to profiles table');
          setRealTimeStatus('error');
          toast.error("Erreur de connexion en temps réel", {
            description: "La mise à jour automatique des utilisateurs peut ne pas fonctionner."
          });
        }
      });
      
    // Clean up subscription on component unmount
    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(profilesChannel);
    };
  }, []);
  
  // Separate effect for sorting changes to avoid duplicate fetching
  useEffect(() => {
    if (!isLoading) {
      console.log('Sort criteria changed, refreshing data');
      fetchUsers();
    }
  }, [sortField, sortDirection]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setIsRefreshing(true);
      
      console.log("Fetching users with sort field:", sortField, "direction:", sortDirection);
      
      // Récupérer TOUS les utilisateurs sans limite et sans filtres
      // Assurez-vous que toutes les colonnes sont sélectionnées
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
        
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log("Fetched users:", data);
      console.log("Number of users fetched:", data ? data.length : 0);
      
      if (data) {
        // Make sure we have data
        setUsers(data);
        
        if (data.length === 0) {
          console.log("No users found in the profiles table");
          toast.info("Base de données vide", {
            description: "Aucun utilisateur trouvé dans la base de données. Vous pouvez créer un utilisateur test."
          });
        } else {
          console.log(`Nombre d'utilisateurs trouvés: ${data.length}`);
          // Log each user to see what we're getting
          data.forEach((user, index) => {
            console.log(`User ${index + 1}:`, user.id, user.first_name, user.last_name, user.email);
          });
        }
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setHasError(true);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to desc
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm.trim()) return true; // Si la recherche est vide, retourne tous les utilisateurs
    
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  return {
    users,
    filteredUsers,
    isLoading,
    hasError,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    fetchUsers,
    realTimeStatus,
    isRefreshing
  };
}
