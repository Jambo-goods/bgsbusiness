
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EmptyReferralState from "../referral/EmptyReferralState";
import ReferralStatsCard from "../referral/ReferralStatsCard";
import ReferralCommissionsList from "../referral/ReferralCommissionsList";

export default function ReferralTab() {
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user's referral code
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("referral_code")
          .eq("id", session.user.id)
          .single();

        if (profileError) throw profileError;
        
        if (profileData && profileData.referral_code) {
          setReferralCode(profileData.referral_code);
        }

        // Get user's referrals
        const { data: referralsData, error: referralsError } = await supabase
          .from("referrals")
          .select(`
            *,
            referred:profiles!referrals_referred_id_fkey(
              id, first_name, last_name, email
            )
          `)
          .eq("referrer_id", session.user.id);

        if (referralsError) throw referralsError;
        
        setReferrals(referralsData || []);
      } catch (err: any) {
        console.error("Error fetching referral data:", err);
        setError(err.message || "Une erreur est survenue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferralData();
    
    // Set up real-time listeners for referrals table
    const referralsChannel = supabase
      .channel('referrals_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'referrals' },
        () => {
          fetchReferralData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(referralsChannel);
    };
  }, []);

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast({
        title: "Code copié",
        description: "Le code de parrainage a été copié dans le presse-papier.",
      });
    }
  };

  const referralUrl = `${window.location.origin}/register?referral=${referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    toast({
      title: "Lien copié",
      description: "Le lien de parrainage a été copié dans le presse-papier.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-[150px] bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="h-[200px] bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Erreur: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Parrainez vos amis et gagnez 10% de commission</CardTitle>
          <CardDescription>
            Partagez votre code ou lien de parrainage et recevez 10% des rendements générés par vos filleuls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Votre code de parrainage</h3>
            <div className="flex">
              <Input
                value={referralCode}
                readOnly
                className="font-medium text-center bg-muted"
              />
              <Button variant="outline" className="ml-2" onClick={copyReferralCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Votre lien de parrainage</h3>
            <div className="flex">
              <Input
                value={referralUrl}
                readOnly
                className="font-medium bg-muted text-xs sm:text-sm"
              />
              <Button variant="outline" className="ml-2" onClick={copyReferralLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {referrals.length > 0 ? (
        <>
          <ReferralStatsCard referrals={referrals} />
          <ReferralCommissionsList />
        </>
      ) : (
        <EmptyReferralState />
      )}
    </div>
  );
}
