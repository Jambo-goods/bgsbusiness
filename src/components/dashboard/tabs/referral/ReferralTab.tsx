
import React, { useEffect, useState } from "react";
import { Copy, Users, Gift, Share2 } from "lucide-react";
import { referralService } from "@/services/referralService";
import ReferralStats from "./ReferralStats";
import ReferralsTable from "./ReferralsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ReferralTab() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReferralData = async () => {
      setIsLoading(true);
      try {
        // Get referral code
        const refCode = await referralService.getReferralCode();
        setReferralCode(refCode?.code || null);
        
        // Generate referral link
        const link = await referralService.generateReferralLink();
        setReferralLink(link);
      } catch (error) {
        console.error("Error fetching referral data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReferralData();
  }, []);
  
  const handleCopyCode = async () => {
    await referralService.copyReferralCode();
  };
  
  const handleCopyLink = async () => {
    await referralService.copyReferralLink();
  };
  
  const handleShare = async () => {
    if (navigator.share && referralLink) {
      try {
        await navigator.share({
          title: 'Rejoignez BGS Groupe',
          text: 'Investissez avec BGS Groupe et recevez un bonus de 25€ en utilisant mon lien de parrainage !',
          url: referralLink,
        });
      } catch (error) {
        console.error('Erreur lors du partage:', error);
        // Fallback to copy
        handleCopyLink();
      }
    } else {
      // Fallback to copy if Web Share API is not available
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Programme de Parrainage</h2>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Comment ça marche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Share2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">1. Partagez votre lien</h4>
                <p className="text-sm text-gray-500">
                  Envoyez votre lien ou code de parrainage à vos proches
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">2. Ils rejoignent BGS Groupe</h4>
                <p className="text-sm text-gray-500">
                  Ils s'inscrivent via votre lien et reçoivent 25€ de bonus
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Gift className="h-5 w-5 text-orange-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">3. Ils investissent</h4>
                <p className="text-sm text-gray-500">
                  Dès leur premier investissement, ils deviennent des filleuls actifs
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Gift className="h-5 w-5 text-purple-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">4. Vous êtes récompensé(e)</h4>
                <p className="text-sm text-gray-500">
                  Vous recevez 25€ pour chaque filleul qui investit
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mon code de parrainage</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-bgs-orange"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-lg font-semibold tracking-wider text-bgs-blue">
                      {referralCode || "Chargement..."}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleCopyCode}
                            disabled={!referralCode}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copier le code</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Partagez ce code avec vos proches pour qu'ils l'utilisent lors de leur inscription
                </p>
                <div className="flex gap-2">
                  <Button 
                    className="w-full" 
                    onClick={handleCopyLink}
                    variant="secondary"
                    disabled={!referralLink}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier mon lien
                  </Button>
                  <Button 
                    className="w-full" 
                    onClick={handleShare}
                    disabled={!referralLink || !navigator.share}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <ReferralStats />
      </div>

      <Separator className="my-6" />
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tous mes filleuls</TabsTrigger>
          <TabsTrigger value="active">Filleuls actifs</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <ReferralsTable filter="all" />
        </TabsContent>
        
        <TabsContent value="active">
          <ReferralsTable filter="active" />
        </TabsContent>
        
        <TabsContent value="pending">
          <ReferralsTable filter="pending" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
