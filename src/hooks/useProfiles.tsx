
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
      console.log("📊 Starting profiles fetch with admin rights...");
      
      // First get the total count using an admin query (to see all profiles)
      const { count, error: countError } = await supabase
        .from("profiles")
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error("❌ Error getting count:", countError);
        throw countError;
      }
      
      setTotalCount(count || 0);
      console.log(`📈 Total count in database: ${count} profiles`);
      
      // Then get all profiles using an admin query
      // Use .from('profiles') without any filters to access all profiles
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) {
        console.error("❌ Error fetching profiles:", error);
        throw error;
      }

      console.log(`✅ Successfully fetched ${data?.length || 0} profiles out of ${count} total`);
      
      if (data && data.length > 0) {
        console.log("📋 First profile sample:", data[0]);
        if (data.length > 1) {
          console.log("📋 Second profile sample:", data[1]);
        }
        console.log("📋 Last profile sample:", data[data.length - 1]);
      } else {
        console.log("⚠️ No profiles returned from query");
      }
      
      // Vérifier les profils reçus en détail
      if (data) {
        data.forEach((profile, index) => {
          console.log(`Profile ${index + 1} ID:`, profile.id);
        });
      }
      
      setProfiles(data || []);
      toast.success(`${data?.length || 0} profils chargés avec succès sur ${count} au total`);
    } catch (error) {
      console.error("❌ Error fetching profiles:", error);
      toast.error("Erreur lors du chargement des profils");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [sortField, sortDirection]);

  useEffect(() => {
    fetchProfiles();

    // Set up real-time listener for the profiles table
    const profilesChannel = supabase
      .channel("profiles_changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "profiles"
      }, (payload) => {
        console.log("👂 Profile change detected:", payload);
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
