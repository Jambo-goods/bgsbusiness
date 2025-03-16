
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeInfo, User, Wallet, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import AddFundsDialog from "./funds/AddFundsDialog";
import { ManualBalanceAdjustment } from "./ManualBalanceAdjustment";

interface UserProfileDetailProps {
  userId: string;
  onClose?: () => void;
}

export function UserProfileDetail({ userId, onClose }: UserProfileDetailProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        
        setUser(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Erreur lors de la récupération du profil");
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);
  
  const handleProfileRefresh = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      setUser(data);
      toast.success("Profil actualisé");
    } catch (error) {
      console.error("Error refreshing profile:", error);
      toast.error("Erreur lors de l'actualisation du profil");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Détails du profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
        </CardContent>
      </Card>
    );
  }
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Détails du profil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Utilisateur non trouvé</p>
          {onClose && (
            <Button onClick={onClose} className="mt-4">
              Fermer
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Détails du profil</CardTitle>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium">Solde du portefeuille</h4>
            </div>
            <p className="text-2xl font-bold">{user.wallet_balance || 0} €</p>
            <div className="mt-2 flex space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsAddFundsOpen(true)}
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                Ajuster
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <BadgeInfo className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium">Statistiques</h4>
            </div>
            <div className="space-y-1">
              <p>Investissement total: <span className="font-medium">{user.investment_total || 0} €</span></p>
              <p>Nombre de projets: <span className="font-medium">{user.projects_count || 0}</span></p>
              <p>Compte créé le: <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span></p>
              {user.last_active_at && (
                <p>Dernière activité: <span className="font-medium">{new Date(user.last_active_at).toLocaleDateString()}</span></p>
              )}
            </div>
          </div>
        </div>
        
        <ManualBalanceAdjustment 
          userId={userId}
          userName={`${user.first_name} ${user.last_name}`}
          currentBalance={user.wallet_balance || 0}
          onBalanceUpdated={handleProfileRefresh}
        />
        
        <AddFundsDialog
          isOpen={isAddFundsOpen}
          onOpenChange={setIsAddFundsOpen}
          userId={userId}
          userName={`${user.first_name} ${user.last_name}`}
          currentBalance={user.wallet_balance || 0}
          onClose={() => setIsAddFundsOpen(false)}
          onSuccess={handleProfileRefresh}
        />
      </CardContent>
    </Card>
  );
}
