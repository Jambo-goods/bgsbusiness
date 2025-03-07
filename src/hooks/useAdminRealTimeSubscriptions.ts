
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionOptions {
  onProfileUpdate?: () => void;
}

export const useAdminRealTimeSubscriptions = ({
  onProfileUpdate,
}: SubscriptionOptions) => {
  const [realTimeStatus, setRealTimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    console.log("Setting up admin real-time subscriptions for profiles");
    
    // Profile changes
    const profilesChannel = supabase
      .channel('admin_profiles_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        console.log('Profile data changed:', payload);
        if (onProfileUpdate) onProfileUpdate();
        toast.info("Mise à jour détectée", {
          description: "Les données utilisateurs ont été mises à jour."
        });
      })
      .subscribe((status) => {
        console.log('Profile subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setRealTimeStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setRealTimeStatus('error');
          console.error('Error subscribing to profile changes');
        }
      });

    return () => {
      console.log('Cleaning up admin real-time subscriptions');
      supabase.removeChannel(profilesChannel);
    };
  }, [onProfileUpdate]);

  return { realTimeStatus };
};
