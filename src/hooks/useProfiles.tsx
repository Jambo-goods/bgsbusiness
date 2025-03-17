
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile } from '@/components/profiles/types';

export default function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("📊 Chargement de tous les profils sans restriction RLS...");
      
      // D'abord obtenir le nombre total de profils
      const { count, error: countError } = await supabase
        .from("profiles")
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error("❌ Erreur lors du comptage des profils:", countError);
        throw countError;
      }
      
      setTotalCount(count || 0);
      console.log(`📈 Nombre total dans la base de données: ${count} profils`);
      
      // Puis récupérer tous les profils (RLS est maintenant désactivé)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) {
        console.error("❌ Erreur lors du chargement des profils:", error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} profils chargés avec succès sur ${count} au total`);
      
      if (data && data.length > 0) {
        console.log(`🔍 Nombre de profils récupérés: ${data.length}`);
        console.log("📋 Premier profil:", data[0]);
        if (data.length > 1) {
          console.log("📋 Deuxième profil:", data[1]);
        }
        console.log("📋 Dernier profil:", data[data.length - 1]);
        
        // Vérifier les IDs de tous les profils
        data.forEach((profile, index) => {
          console.log(`Profil ${index + 1} | ID: ${profile.id} | Nom: ${profile.first_name} ${profile.last_name}`);
        });
      } else {
        console.log("⚠️ Aucun profil retourné par la requête malgré la désactivation de RLS");
      }
      
      setProfiles(data || []);
      toast.success(`${data?.length || 0} profils chargés avec succès sur ${count} au total`);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des profils:", error);
      toast.error("Erreur lors du chargement des profils");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [sortField, sortDirection]);

  useEffect(() => {
    fetchProfiles();

    // Configuration de l'écouteur temps réel pour la table profiles
    const profilesChannel = supabase
      .channel("profiles_changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "profiles"
      }, (payload) => {
        console.log("👂 Changement de profil détecté:", payload);
        fetchProfiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
    };
  }, [fetchProfiles]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const refreshProfiles = () => {
    setIsRefreshing(true);
    fetchProfiles();
  };

  const filteredProfiles = profiles.filter(profile => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (profile.first_name && profile.first_name.toLowerCase().includes(searchLower)) || 
      (profile.last_name && profile.last_name.toLowerCase().includes(searchLower)) || 
      (profile.email && profile.email.toLowerCase().includes(searchLower)) ||
      (profile.phone && profile.phone.toLowerCase().includes(searchLower)) ||
      (profile.referral_code && profile.referral_code.toLowerCase().includes(searchLower))
    );
  });

  return {
    profiles,
    filteredProfiles,
    isLoading,
    isRefreshing,
    searchTerm,
    setSearchTerm,
    totalCount,
    sortField,
    sortDirection,
    handleSort,
    refreshProfiles
  };
}
