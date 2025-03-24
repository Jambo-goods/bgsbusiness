
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, User, ArrowUpRight, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import useUserProfile from "@/hooks/useUserProfile";
import ReferralStatsCard from "../referral/ReferralStatsCard";
import EmptyReferralState from "../referral/EmptyReferralState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReferredUser {
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface Referral {
  id: string;
  referred_id: string;
  referrer_id: string;
  status: string;
  total_commission: number;
  created_at: string;
  referred_user?: ReferredUser;
}

interface Commission {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  source: string;
  referred_id: string;
  referred_user?: ReferredUser;
}

export default function ReferralTab() {
  const { toast } = useToast();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const [isReferralLoading, setIsReferralLoading] = useState(true);
  const [isCommissionLoading, setIsCommissionLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState({
    referralCount: 0,
    totalCommission: 0,
    validReferrals: 0
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        if (!profile?.id) return;
        
        setIsReferralLoading(true);
        console.log("Fetching referrals for user:", profile.id);
        
        // Get referrals where current user is the referrer
        const { data, error } = await supabase
          .from('referrals')
          .select(`
            id,
            referred_id,
            referrer_id,
            status,
            total_commission,
            created_at,
            referred_user:profiles!referred_id(
              first_name,
              last_name,
              email
            )
          `)
          .eq('referrer_id', profile.id);
          
        if (error) {
          console.error("Error fetching referrals:", error);
          throw error;
        }
        
        console.log("Referrals data:", data);
        setReferrals(data as Referral[] || []);
        
        // Calculate statistics based on actual commissions in the database
        if (data) {
          // We'll get the actual commission data from referral_commissions table
          // for more accurate stats
          const { data: commissionsData, error: commissionsError } = await supabase
            .from('referral_commissions')
            .select('amount, status')
            .eq('referrer_id', profile.id)
            .eq('status', 'completed');
            
          if (commissionsError) {
            console.error("Error fetching commission stats:", commissionsError);
          }
          
          const totalCommission = commissionsData 
            ? commissionsData.reduce((sum, comm) => sum + (comm.amount || 0), 0) 
            : data.reduce((sum, ref) => sum + (ref.total_commission || 0), 0);
            
          const validReferrals = data.filter(ref => ref.status === 'valid').length;
          
          setStats({
            referralCount: data.length,
            totalCommission: totalCommission,
            validReferrals: validReferrals
          });
        }
      } catch (error) {
        console.error("Error in fetchReferrals:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos parrainages",
          variant: "destructive",
        });
      } finally {
        setIsReferralLoading(false);
      }
    };
    
    const fetchCommissions = async () => {
      try {
        if (!profile?.id) return;
        
        setIsCommissionLoading(true);
        console.log("Fetching commissions for user:", profile.id);
        
        // Get referral commissions where current user is the referrer
        const { data, error } = await supabase
          .from('referral_commissions')
          .select(`
            id,
            amount,
            status,
            created_at,
            source,
            referred_id,
            referred_user:profiles!referred_id(
              first_name,
              last_name,
              email
            )
          `)
          .eq('referrer_id', profile.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching commissions:", error);
          throw error;
        }
        
        console.log("Commissions data:", data);
        setCommissions(data as Commission[] || []);
      } catch (error) {
        console.error("Error in fetchCommissions:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos commissions",
          variant: "destructive",
        });
      } finally {
        setIsCommissionLoading(false);
      }
    };
    
    // Also check for commissions in wallet_transactions
    const fetchWalletCommissions = async () => {
      try {
        if (!profile?.id) return;
        
        console.log("Fetching wallet commissions for user:", profile.id);
        
        // Get commission transactions
        const { data, error } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', profile.id)
          .eq('type', 'commission')
          .eq('status', 'completed')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching wallet commissions:", error);
          return;
        }
        
        console.log("Wallet commission transactions:", data?.length || 0);
        
        if (data && data.length > 0) {
          // If we have commission transactions but no commissions in the referral_commissions table
          // this means the commission was processed but the referral_commissions table was not updated
          if (commissions.length === 0) {
            console.log("Found wallet commission transactions but no referral commissions");
            
            // Let's force a refresh of the referrals data
            fetchReferrals();
            fetchCommissions();
          }
        }
      } catch (error) {
        console.error("Error checking wallet commissions:", error);
      }
    };
    
    if (profile?.id) {
      fetchReferrals();
      fetchCommissions();
      fetchWalletCommissions();
      
      // Set up realtime listeners
      const referralsChannel = supabase
        .channel('referrals_changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'referrals', filter: `referrer_id=eq.${profile.id}` }, 
            () => {
              console.log('Referrals changed, refreshing');
              fetchReferrals();
            })
        .subscribe();
        
      const commissionsChannel = supabase
        .channel('commissions_changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'referral_commissions', filter: `referrer_id=eq.${profile.id}` }, 
            () => {
              console.log('Commissions changed, refreshing');
              fetchCommissions();
            })
        .subscribe();
        
      const walletTransactionsChannel = supabase
        .channel('wallet_transactions_for_commissions')
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${profile.id}` },
            (payload) => {
              if (payload.new && payload.new.type === 'commission') {
                console.log('New commission transaction detected, refreshing data');
                fetchReferrals();
                fetchCommissions();
              }
            })
        .subscribe();
      
      return () => {
        supabase.removeChannel(referralsChannel);
        supabase.removeChannel(commissionsChannel);
        supabase.removeChannel(walletTransactionsChannel);
      };
    }
  }, [profile?.id, toast]);

  const copyReferralLink = () => {
    if (!profile?.referral_code) return;
    
    const domainUrl = window.location.origin;
    const referralLink = `${domainUrl}/register?ref=${profile.referral_code}`;
    
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCopied(true);
        toast({
          title: "Lien copié !",
          description: "Le lien de parrainage a été copié dans le presse-papier.",
          variant: "default",
        });
        
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Erreur lors de la copie:', err);
        toast({
          title: "Erreur",
          description: "Impossible de copier le lien",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">Programme de Parrainage</h2>
        <p className="text-muted-foreground">
          Parrainez vos amis et recevez une commission de 10% sur leurs rendements (versements programmés).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Votre lien de parrainage</CardTitle>
          <CardDescription>
            Partagez ce lien avec vos amis et gagnez des commissions sur leurs rendements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 bg-muted p-3 rounded-md text-xs sm:text-sm break-all">
                {profile?.referral_code ? (
                  `${window.location.origin}/register?ref=${profile.referral_code}`
                ) : (
                  "Chargement de votre code de parrainage..."
                )}
              </div>
              <Button 
                onClick={copyReferralLink} 
                className="w-full sm:w-auto"
                disabled={!profile?.referral_code}
              >
                {copied ? <CheckCircle className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copié!" : "Copier le lien"}
              </Button>
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              <strong>Votre code:</strong> {profileLoading ? "Chargement..." : profile?.referral_code || "Non disponible"}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
        <ReferralStatsCard 
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          title="Filleuls"
          value={isReferralLoading ? "-" : stats.referralCount.toString()}
          description="Personnes parrainées"
          loading={isReferralLoading}
        />
        
        <ReferralStatsCard 
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          title="Actifs"
          value={isReferralLoading ? "-" : stats.validReferrals.toString()}
          description="Filleuls validés"
          loading={isReferralLoading}
        />
        
        <ReferralStatsCard 
          icon={<ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
          title="Total des commissions"
          value={isReferralLoading ? "-" : `${stats.totalCommission.toFixed(2)} €`}
          description="Commissions gagnées"
          loading={isReferralLoading}
          highlighted
        />
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Vos filleuls</CardTitle>
            <CardDescription>
              Liste des personnes que vous avez parrainées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isReferralLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : referrals.length === 0 ? (
              <EmptyReferralState />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Filleul</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Commission Totale</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {referral.referred_user?.first_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {referral.referred_user?.first_name || 'Utilisateur'} {referral.referred_user?.last_name || ''}
                            </span>
                            <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {referral.referred_user?.email || 'Email non disponible'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={referral.status === 'valid' ? 'default' : 'outline'}>
                            {referral.status === 'valid' ? 'Validé' : 
                             referral.status === 'pending' ? 'En attente' : 
                             referral.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {referral.total_commission.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {new Date(referral.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Historique des commissions</CardTitle>
            <CardDescription>
              Détail des commissions reçues (10% des rendements de vos filleuls).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCommissionLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : commissions.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Vous n'avez pas encore reçu de commissions. Lorsque vos filleuls recevront des rendements, 
                  vous recevrez automatiquement une commission de 10% de ces rendements.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Filleul</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell className="text-sm">
                          {new Date(commission.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate">
                          {commission.referred_user?.first_name || 'Utilisateur'} {commission.referred_user?.last_name || ''}
                        </TableCell>
                        <TableCell>
                          {commission.source === 'investment_yield' ? 'Rendement' : 
                           commission.source === 'investment_payment' ? 'Versement programmé' :
                           commission.source === 'signup' ? 'Inscription' : 
                           commission.source}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {commission.amount.toFixed(2)} €
                        </TableCell>
                        <TableCell>
                          <Badge variant={commission.status === 'completed' ? 'default' : 'outline'}>
                            {commission.status === 'completed' ? 'Payé' : 
                             commission.status === 'pending' ? 'En attente' : 
                             commission.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
