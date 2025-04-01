
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/components/admin/profiles/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, User, Wallet, Calendar, Clock, Building, Mail, Phone, MapPin, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import AdminHeader from '@/components/admin/AdminHeader';
import AddFundsDialog from '@/components/admin/profiles/funds/AddFundsDialog';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        console.log("Fetched user profile:", data);
        setProfile(data as Profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Erreur lors du chargement du profil utilisateur");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [id]);

  const handleGoBack = () => {
    navigate('/admin/profiles');
  };

  const handleAddFundsSuccess = async () => {
    setIsAddFundsOpen(false);
    
    try {
      // Refresh profile data after adding funds
      if (id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setProfile(data as Profile);
        toast.success("Opération réussie", {
          description: "Le solde du portefeuille a été mis à jour"
        });
      }
    } catch (error) {
      console.error("Error refreshing profile data:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <AdminHeader 
          title="Chargement du profil" 
          description="Veuillez patienter..." 
        />
        <Card>
          <CardContent className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6 p-6">
        <AdminHeader 
          title="Profil non trouvé" 
          description="Le profil utilisateur demandé n'existe pas" 
        />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Impossible de trouver le profil utilisateur demandé.</p>
            <Button onClick={handleGoBack}>Retour à la liste</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleGoBack} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
      </div>
      
      <AdminHeader 
        title={`${profile.first_name || ''} ${profile.last_name || ''}`}
        description={`Profil utilisateur - ${profile.email || 'Aucun email'}`}
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prénom</p>
                <p>{profile.first_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nom</p>
                <p>{profile.last_name || '-'}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p>{profile.email || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p>{profile.phone || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Adresse</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p>{profile.address || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Informations financières
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Solde du portefeuille</p>
              <p className="text-2xl font-bold">{profile.wallet_balance || 0} €</p>
              <Button 
                className="mt-2" 
                onClick={() => setIsAddFundsOpen(true)}
                variant="outline"
                size="sm"
              >
                Gérer les fonds
              </Button>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total investi</p>
                <p className="text-xl font-semibold">{profile.investment_total || 0} €</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre de projets</p>
                <p className="text-xl font-semibold">{profile.projects_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activité du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date d'inscription</p>
                <p>
                  {profile.created_at 
                    ? format(new Date(profile.created_at), 'PPP', { locale: fr }) 
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dernière activité</p>
                <p>
                  {profile.last_active_at 
                    ? format(new Date(profile.last_active_at), 'PPP à HH:mm', { locale: fr })
                    : '-'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Statut</p>
              <div className="flex items-center mt-1">
                <div 
                  className={`h-3 w-3 rounded-full mr-2 ${
                    profile.online_status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <p>{profile.online_status === 'online' ? 'En ligne' : 'Hors ligne'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {profile && (
        <AddFundsDialog
          isOpen={isAddFundsOpen}
          onOpenChange={setIsAddFundsOpen}
          userId={profile.id}
          userName={`${profile.first_name || ''} ${profile.last_name || ''}`}
          currentBalance={profile.wallet_balance || 0}
          onSuccess={handleAddFundsSuccess}
          onClose={() => setIsAddFundsOpen(false)}
        />
      )}
    </div>
  );
}
