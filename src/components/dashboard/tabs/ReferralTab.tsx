
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
        
        // Get user profile to get referral code
        const { data: profile } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', userId)
          .single();
        
        // If user doesn't have a referral code, generate one
        if (!profile?.referral_code) {
          // Generate a random code based on user id and timestamp
          const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          
          // Save the referral code to user profile
          await supabase
            .from('profiles')
            .update({ referral_code: randomCode })
            .eq('id', userId);
            
          setReferralCode(randomCode);
        } else {
          setReferralCode(profile.referral_code);
        }
        
        // Get referrals
        const { data: referralsData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, created_at, wallet_balance')
          .eq('referred_by', userId);
          
        if (referralsData) {
          setReferrals(referralsData);
          setStats(prev => ({
            ...prev,
            totalReferrals: referralsData.length,
            activeReferrals: referralsData.filter(r => r.wallet_balance > 0).length
          }));
        }
        
        // Get commission transactions
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
      // Fallback to copy if sharing is not supported
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
        Parrainez vos amis et recevez 10% de commission sur leurs rendements. Plus vous parrainez, plus vous gagnez !
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
      <Card className="overflow-hidden border-2 border-amber-100">
        <CardHeader className="bg-amber-50">
          <CardTitle className="text-amber-800">Votre code de parrainage</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="bg-amber-50 p-4 rounded-lg text-center">
              <span className="text-2xl font-bold tracking-wider text-amber-800">{referralCode}</span>
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
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Option 1: Partager votre lien de parrainage</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm pl-2">
                      <li>Copiez votre lien de parrainage en cliquant sur le bouton "Copier" ci-dessus</li>
                      <li>Partagez ce lien avec vos amis par email, SMS ou réseaux sociaux</li>
                      <li>Quand ils cliqueront sur le lien, ils seront dirigés vers la page d'inscription</li>
                      <li>Votre code de parrainage sera automatiquement rempli dans le formulaire</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Option 2: Partager votre code de parrainage</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm pl-2">
                      <li>Communiquez votre code de parrainage à vos amis ({referralCode})</li>
                      <li>Ils devront se rendre sur la page d'inscription: {window.location.origin}/register</li>
                      <li>Dans le formulaire d'inscription, ils devront saisir votre code dans le champ "Code parrain"</li>
                      <li>Une fois inscrits, ils apparaîtront dans votre liste de filleuls ci-dessous</li>
                    </ol>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md border border-blue-200">
                    <p className="text-sm font-medium">Important:</p>
                    <ul className="list-disc list-inside text-sm pl-2">
                      <li>Vos filleuls doivent utiliser votre code lors de leur inscription</li>
                      <li>Vous recevrez 10% de commission sur leurs rendements automatiquement</li>
                      <li>Les commissions seront créditées directement sur votre portefeuille</li>
                      <li>Vous pouvez suivre vos commissions dans l'onglet "Historique des commissions"</li>
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
