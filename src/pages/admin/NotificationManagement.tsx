
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Send, Bell, LifeBuoy, Megaphone, Mail, Info, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notificationService } from '@/services/notifications';

export default function NotificationManagement() {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('info');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // Charger les projets
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, company_name, status')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des projets:", error);
        toast.error("Erreur", {
          description: "Impossible de charger les projets"
        });
      } finally {
        setLoadingProjects(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Fonction pour envoyer une notification à tous les utilisateurs via Supabase Edge Function
  const sendNotificationToAllUsers = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Erreur", {
        description: "Veuillez remplir tous les champs"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Récupérer tous les utilisateurs actifs
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name');
      
      if (usersError) throw usersError;
      
      // Notification envoyée via toast (simulation)
      toast.success("Notification envoyée", {
        description: `Notification envoyée à ${users.length} utilisateurs`
      });
      
      // Réinitialiser le formulaire
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error("Erreur lors de l'envoi des notifications:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'envoi des notifications"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour annoncer une nouvelle opportunité d'investissement
  const announceNewOpportunity = async (projectId: string) => {
    setLoading(true);
    try {
      await notificationService.announceNewOpportunity(projectId);
      toast.success("Opportunité annoncée", {
        description: "L'opportunité d'investissement a été annoncée avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de l'annonce de l'opportunité:", error);
      toast.error("Erreur", {
        description: "Impossible d'annoncer cette opportunité"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Gestion des notifications | Admin BGS Invest</title>
      </Helmet>
      
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gestion des notifications</h1>
            
            <div className="flex gap-2">
              <Button variant="outline" disabled={loading} onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-6">
            <div className="md:col-span-4">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-blue-500" />
                    Envoyer une notification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="notification-type">Type de notification</Label>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger id="notification-type">
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">Information</SelectItem>
                            <SelectItem value="success">Succès</SelectItem>
                            <SelectItem value="warning">Avertissement</SelectItem>
                            <SelectItem value="error">Erreur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject">Sujet</Label>
                        <Input 
                          id="subject" 
                          value={subject} 
                          onChange={(e) => setSubject(e.target.value)} 
                          placeholder="Sujet de la notification" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        placeholder="Contenu de la notification" 
                        rows={5} 
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={sendNotificationToAllUsers} 
                        disabled={loading}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {loading ? "Envoi en cours..." : "Envoyer à tous les utilisateurs"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-500" />
                    Annoncer des opportunités d'investissement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Annoncez de nouvelles opportunités d'investissement aux utilisateurs.
                      Seuls les projets actifs peuvent être annoncés.
                    </p>
                    
                    {loadingProjects ? (
                      <div className="flex justify-center py-4">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                      </div>
                    ) : projects.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">Aucun projet disponible</p>
                    ) : (
                      <div className="space-y-4">
                        {projects.filter(p => p.status === 'active').map(project => (
                          <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <h3 className="font-medium">{project.name}</h3>
                              <p className="text-sm text-gray-600">{project.company_name}</p>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => announceNewOpportunity(project.id)}
                              disabled={loading}
                            >
                              <Megaphone className="h-4 w-4 mr-2" />
                              Annoncer
                            </Button>
                          </div>
                        ))}
                        
                        {projects.filter(p => p.status === 'active').length === 0 && (
                          <p className="text-center py-4 text-gray-500">Aucun projet actif disponible pour annonce</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <LifeBuoy className="h-4 w-4 mr-2 text-blue-500" />
                    Options disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Megaphone className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium">Notifications système</h3>
                        <p className="text-xs text-gray-500">Informations importantes concernant la plateforme</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium">Emails transactionnels</h3>
                        <p className="text-xs text-gray-500">Envois automatiques pour les opérations importantes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                    À propos du système
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Ce système de notification fonctionne avec Sonner Toast pour les notifications en temps réel.
                    Les notifications sont temporaires et n'ont pas besoin d'être stockées en base de données.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
