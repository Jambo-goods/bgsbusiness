
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clipboard, Check, Users, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ReferralData {
  id: string;
  referrer_id: string;
  referred_id: string;
  created_at: string;
  status: string;
  total_commission: number;
  referred_user?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

interface CommissionData {
  id: string;
  amount: number;
  source: string;
  created_at: string;
  status: string;
}

export default function ReferralTab() {
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [referralsCount, setReferralsCount] = useState(0);

  useEffect(() => {
    fetchUserData();
    fetchReferrals();
    fetchCommissions();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Veuillez vous connecter pour accéder à votre programme de parrainage");
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', session.session.user.id)
        .single();
        
      if (error) throw error;
      
      if (data?.referral_code) {
        setReferralCode(data.referral_code);
        setReferralLink(`${window.location.origin}/register?ref=${data.referral_code}`);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du code de parrainage:", error);
      toast.error("Impossible de récupérer votre code de parrainage");
    }
  };

  const fetchReferrals = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) return;
      
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_user:referred_id(
            first_name,
            last_name,
            email
          )
        `)
        .eq('referrer_id', session.session.user.id);
        
      if (error) throw error;
      
      if (data) {
        setReferrals(data);
        setReferralsCount(data.length);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des filleuls:", error);
      toast.error("Impossible de récupérer vos filleuls");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommissions = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) return;
      
      const { data, error } = await supabase
        .from('referral_commissions')
        .select('*')
        .eq('referrer_id', session.session.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setCommissions(data);
        
        // Calculate total earned from commissions
        const total = data.reduce((sum, commission) => {
          return sum + (commission.amount || 0);
        }, 0);
        
        setTotalEarned(total);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des commissions:", error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Lien de parrainage copié !");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-0">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-0">En attente</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-0">Inactif</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-0">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Programme de Parrainage</CardTitle>
          <CardDescription>
            Parrainez vos amis et recevez 10% de commission sur leurs rendements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-500">Total Commissions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalEarned.toLocaleString()} €</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-500">Filleuls Parrainés</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-400" />
                <p className="text-2xl font-bold">{referralsCount}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-500">Commission Moyenne</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {referralsCount ? (totalEarned / referralsCount).toFixed(2) : "0"} €
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Votre Lien de Parrainage</CardTitle>
              <CardDescription>
                Partagez ce lien avec vos amis et recevez 10% de commission sur leurs rendements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-stretch gap-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input 
                    value={referralLink} 
                    className="pl-10" 
                    readOnly 
                  />
                </div>
                <Button 
                  size="sm"
                  variant={copied ? "success" : "default"}
                  onClick={copyToClipboard}
                  className={copied ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {copied ? (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Copié
                    </>
                  ) : (
                    <>
                      <Clipboard className="mr-1 h-4 w-4" /> Copier
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Votre code de parrainage :</span>
                <span className="font-mono font-medium text-gray-700">{referralCode}</span>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Vos Filleuls</h3>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : referrals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Commission totale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-medium">
                        {referral.referred_user?.first_name} {referral.referred_user?.last_name}
                      </TableCell>
                      <TableCell>{referral.referred_user?.email}</TableCell>
                      <TableCell>{formatDate(referral.created_at)}</TableCell>
                      <TableCell>{getStatusBadge(referral.status)}</TableCell>
                      <TableCell className="text-right">{referral.total_commission.toLocaleString()} €</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Card className="border border-dashed">
                <CardContent className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-lg font-medium">Aucun filleul pour l'instant</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Partagez votre lien de parrainage avec vos amis pour commencer à gagner des commissions.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {commissions.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Historique des Commissions</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>{formatDate(commission.created_at)}</TableCell>
                      <TableCell>
                        {commission.source === 'investment_yield' 
                          ? 'Rendement d\'investissement' 
                          : commission.source}
                      </TableCell>
                      <TableCell>{getStatusBadge(commission.status)}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        +{commission.amount.toLocaleString()} €
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
  );
}
