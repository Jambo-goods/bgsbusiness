
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Users, CreditCard, CheckCircle, Share2, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ReferralTab() {
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommissions: 0
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setIsLoading(true);
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          console.error("No active session");
          return;
        }
        
        const userId = session.session.user.id;
        
        // Fetch user's referral code
        const { data: profile } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', userId)
          .single();
        
        if (!profile?.referral_code) {
          // Generate a new referral code if not present
          const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          await supabase
            .from('profiles')
            .update({ referral_code: randomCode })
            .eq('id', userId);
            
          setReferralCode(randomCode);
        } else {
          setReferralCode(profile.referral_code);
        }
        
        // Fetch all referrals from the referrals table
        const { data: referralData } = await supabase
          .from('referrals')
          .select('referred_id, status, created_at')
          .eq('referrer_id', userId);
          
        if (referralData && referralData.length > 0) {
          // Get detailed profile information for each referred user
          const referredIds = referralData.map(ref => ref.referred_id);
          
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, created_at, wallet_balance')
            .in('id', referredIds);
            
          if (profilesData) {
            // Combine referral data with profile data
            const combinedData = profilesData.map(profile => {
              const referral = referralData.find(r => r.referred_id === profile.id);
              return {
                ...profile,
                referral_status: referral?.status || 'pending',
                referral_date: referral?.created_at || profile.created_at
              };
            });
            
            setReferrals(combinedData);
            setStats(prev => ({
              ...prev,
              totalReferrals: combinedData.length,
              activeReferrals: combinedData.filter(r => r.wallet_balance > 0).length
            }));
          }
        } else {
          setReferrals([]);
        }
        
        // Fetch all commission transactions
        const { data: commissionsData } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', userId)
          .eq('type', 'commission')
          .order('created_at', { ascending: false });
          
        if (commissionsData) {
          setCommissions(commissionsData);
          setStats(prev => ({
            ...prev,
            totalCommissions: commissionsData.reduce((sum, c) => sum + c.amount, 0)
          }));
        }
      } catch (error) {
        console.error("Error fetching referral data:", error);
        toast.error("Erreur lors du chargement des données de parrainage");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReferralData();
  }, []);

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Lien de parrainage copié !");
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const shareReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Rejoignez BGS Business Club',
        text: 'Inscrivez-vous à BGS Business Club avec mon code de parrainage et recevez des avantages exclusifs !',
        url: link,
      })
      .then(() => toast.success("Merci d'avoir partagé !"))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      copyReferralLink();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bgs-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-bgs-blue">Programme de Parrainage</h2>
      
      <p className="text-gray-600">
        Parrainez vos amis et recevez 10% de commission sur leurs rendements.
      </p>
      
      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-600">Total de filleuls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-bgs-blue mr-2" />
              <span className="text-2xl font-bold">{stats.totalReferrals}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-600">Filleuls actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{stats.activeReferrals}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-600">Total des commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-2xl font-bold">{stats.totalCommissions}€</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Referral Link and Code */}
      <Card className="overflow-hidden border-2 border-gray-200">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-gray-800">Votre code de parrainage</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <span className="text-2xl font-bold tracking-wider text-gray-800">{referralCode}</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={`${window.location.origin}/register?ref=${referralCode}`}
                  className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-bgs-blue/30"
                  readOnly
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={copyReferralLink}
                  className="flex items-center gap-2"
                  variant={copied ? "outline" : "default"}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copier
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={shareReferralLink}
                  className="flex items-center gap-2"
                  variant="secondary"
                >
                  <Share2 className="h-4 w-4" />
                  Partager
                </Button>
              </div>
            </div>
            
            {/* Guide d'utilisation - Comment inviter des filleuls */}
            <Card className="border-blue-100 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-800 flex items-center text-lg">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Comment inviter des filleuls ?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-medium">Partager votre lien ou code</h4>
                    <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                      <li>Copiez le lien ci-dessus ou partagez votre code: <span className="font-bold">{referralCode}</span></li>
                      <li>Vos filleuls s'inscrivent via ce lien ou utilisent votre code</li>
                      <li>Vous recevez 10% de commission sur leurs rendements</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      {/* Referrals & Commissions Tabs */}
      <Tabs defaultValue="referrals">
        <TabsList>
          <TabsTrigger value="referrals">Mes filleuls</TabsTrigger>
          <TabsTrigger value="commissions">Historique des commissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="referrals" className="mt-4">
          {referrals.length > 0 ? (
            <Card>
              <CardContent className="p-0 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell>
                          {referral.first_name} {referral.last_name}
                        </TableCell>
                        <TableCell>
                          {new Date(referral.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={referral.wallet_balance > 0 ? "success" : "secondary"}>
                            {referral.wallet_balance > 0 ? "Actif" : "Inscrit"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-800">Aucun filleul pour le moment</h3>
              <p className="text-gray-500 mt-1">Partagez votre code pour commencer à parrainer</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="commissions" className="mt-4">
          {commissions.length > 0 ? (
            <Card>
              <CardContent className="p-0 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell>
                          {new Date(commission.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {commission.description || "Commission de parrainage"}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          +{commission.amount}€
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <CreditCard className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-800">Aucune commission pour le moment</h3>
              <p className="text-gray-500 mt-1">Vos commissions apparaîtront ici</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
