
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, RefreshCw, Send, Trash } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { NotificationType, NotificationCategory } from '@/services/notifications/types';

interface DatabaseNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  category?: string;
  created_at: string;
  user_id: string;
  seen: boolean;
  data?: any;
}

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<DatabaseNotification | null>(null);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as NotificationType,
    category: 'info' as NotificationCategory,
    user_id: '',
  });
  const [bulkNotification, setBulkNotification] = useState({
    title: '',
    message: '',
    type: 'info' as NotificationType,
    category: 'info' as NotificationCategory,
  });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const handleCreateNotification = async () => {
    try {
      setIsSending(true);
      
      if (!newNotification.title || !newNotification.message || !newNotification.user_id) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      const notificationData = {
        category: newNotification.category
      };
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          title: newNotification.title,
          message: newNotification.message,
          type: newNotification.type,
          user_id: newNotification.user_id,
          seen: false,
          data: notificationData
        });
      
      if (error) throw error;
      
      toast.success('Notification créée avec succès');
      setIsCreateDialogOpen(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'info' as NotificationType,
        category: 'info' as NotificationCategory,
        user_id: '',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Erreur lors de la création de la notification');
    } finally {
      setIsSending(false);
    }
  };

  const handleBulkNotification = async () => {
    try {
      setIsSending(true);
      
      if (!bulkNotification.title || !bulkNotification.message) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      // Get all user IDs
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id');
      
      if (usersError) throw usersError;
      
      if (!users || users.length === 0) {
        toast.error('Aucun utilisateur trouvé');
        return;
      }
      
      const notificationData = {
        category: bulkNotification.category
      };
      
      // Create notifications for all users
      const notificationsToInsert = users.map(user => ({
        title: bulkNotification.title,
        message: bulkNotification.message,
        type: bulkNotification.type,
        user_id: user.id,
        seen: false,
        data: notificationData
      }));
      
      const { error } = await supabase
        .from('notifications')
        .insert(notificationsToInsert);
      
      if (error) throw error;
      
      toast.success(`Notifications envoyées à ${users.length} utilisateurs`);
      setIsBulkDialogOpen(false);
      setBulkNotification({
        title: '',
        message: '',
        type: 'info' as NotificationType,
        category: 'info' as NotificationCategory,
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      toast.error('Erreur lors de l\'envoi des notifications en masse');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteNotification = async () => {
    try {
      setIsSending(true);
      
      if (!selectedNotification) {
        toast.error('Aucune notification sélectionnée');
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', selectedNotification.id);
      
      if (error) throw error;
      
      toast.success('Notification supprimée avec succès');
      setIsDeleteDialogOpen(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Erreur lors de la suppression de la notification');
    } finally {
      setIsSending(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      notification.title.toLowerCase().includes(searchLower) ||
      notification.message.toLowerCase().includes(searchLower) ||
      notification.user_id.toLowerCase().includes(searchLower)
    );
  });

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
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              
              <Button onClick={() => setIsBulkDialogOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Notification en masse
              </Button>
              
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Nouvelle notification
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <Input
                placeholder="Rechercher une notification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Aucune notification trouvée
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                            notification.type === 'success' ? 'bg-green-100 text-green-800' :
                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {notification.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          <span>Utilisateur: {notification.user_id}</span>
                          <span className="ml-4">Catégorie: {notification.data?.category || 'N/A'}</span>
                          <span className="ml-4">
                            Statut: {notification.seen ? 'Lue' : 'Non lue'}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedNotification(notification);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
      
      {/* Create Notification Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une notification</DialogTitle>
            <DialogDescription>
              Envoyez une notification à un utilisateur spécifique.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ID de l'utilisateur</label>
              <Input
                placeholder="ID de l'utilisateur"
                value={newNotification.user_id}
                onChange={(e) => setNewNotification({...newNotification, user_id: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre</label>
              <Input
                placeholder="Titre de la notification"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Description de la notification"
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value) => setNewNotification({...newNotification, type: value as NotificationType})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="deposit">Dépôt</SelectItem>
                    <SelectItem value="withdrawal">Retrait</SelectItem>
                    <SelectItem value="investment">Investissement</SelectItem>
                    <SelectItem value="security">Sécurité</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Catégorie</label>
                <Select
                  value={newNotification.category}
                  onValueChange={(value) => setNewNotification({...newNotification, category: value as NotificationCategory})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="success">Succès</SelectItem>
                    <SelectItem value="warning">Avertissement</SelectItem>
                    <SelectItem value="error">Erreur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateNotification} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Notification Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification en masse</DialogTitle>
            <DialogDescription>
              Envoyez une notification à tous les utilisateurs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre</label>
              <Input
                placeholder="Titre de la notification"
                value={bulkNotification.title}
                onChange={(e) => setBulkNotification({...bulkNotification, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Description de la notification"
                value={bulkNotification.message}
                onChange={(e) => setBulkNotification({...bulkNotification, message: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={bulkNotification.type}
                  onValueChange={(value) => setBulkNotification({...bulkNotification, type: value as NotificationType})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="deposit">Dépôt</SelectItem>
                    <SelectItem value="withdrawal">Retrait</SelectItem>
                    <SelectItem value="investment">Investissement</SelectItem>
                    <SelectItem value="security">Sécurité</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Catégorie</label>
                <Select
                  value={bulkNotification.category}
                  onValueChange={(value) => setBulkNotification({...bulkNotification, category: value as NotificationCategory})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="success">Succès</SelectItem>
                    <SelectItem value="warning">Avertissement</SelectItem>
                    <SelectItem value="error">Erreur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleBulkNotification} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer à tous
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la notification</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette notification ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="py-4">
              <p className="font-medium">{selectedNotification.title}</p>
              <p className="text-sm text-gray-500 mt-1">{selectedNotification.message}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteNotification} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
