
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfilesRealTimeSubscription = (
  initialProfiles: any[],
  onProfilesUpdate: () => void
) => {
  const [realTimeStatus, setRealTimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    console.log("Setting up real-time subscriptions for profiles");
    
    // Subscribe to all changes on the profiles table
    const profilesChannel = supabase
      .channel('public:profiles')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        console.log('Profile data changed:', payload);
        
        // Refresh data when any profile changes
        onProfilesUpdate();
        
        // Show a toast notification
        const eventType = payload.eventType;
        if (eventType === 'INSERT') {
          toast.info("Nouvel utilisateur", {
            description: "Un nouvel utilisateur s'est inscrit."
          });
        } else if (eventType === 'UPDATE') {
          toast.info("Profil mis à jour", {
            description: "Les informations d'un utilisateur ont été mises à jour."
          });
        } else if (eventType === 'DELETE') {
          toast.info("Utilisateur supprimé", {
            description: "Un utilisateur a été supprimé."
          });
        }
      })
      .subscribe((status) => {
        console.log('Profiles subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setRealTimeStatus('connected');
          console.log('Successfully subscribed to profiles table');
        } else if (status === 'CHANNEL_ERROR') {
          setRealTimeStatus('error');
          console.error('Error subscribing to profile changes');
        }
      });
      
    return () => {
      console.log('Cleaning up profiles real-time subscription');
      supabase.removeChannel(profilesChannel);
    };
  }, [onProfilesUpdate]);

  return { realTimeStatus };
};
