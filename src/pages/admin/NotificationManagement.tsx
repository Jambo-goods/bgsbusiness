
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Notification, NotificationCategory, NotificationType } from "@/services/notifications";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Trash, RefreshCw, Pencil } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<NotificationType>("marketing");
  const [category, setCategory] = useState<NotificationCategory>("info");
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState<{id: string, email: string, name: string}[]>([]);
  
  const notificationTypes: NotificationType[] = [
    "deposit", "withdrawal", "investment", "security", "marketing"
  ];
  
  const notificationCategories: NotificationCategory[] = [
    "info", "success", "warning", "error"
  ];
  
  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);
  
  const fetchNotifications = async () => {
    try {
      setIsRefreshing(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedNotifications = data.map(notification => ({
        id: notification.id,
        title: notification.title,
        description: notification.description,
        date: new Date(notification.created_at),
        read: notification.read,
        type: notification.type as NotificationType,
        category: notification.category as NotificationCategory,
        metadata: notification.metadata || {},
        user_id: notification.user_id
      }));
      
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Erreur lors du chargement des notifications");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name');
        
      if (error) throw error;
      
      setUsers(data.map(user => ({
        id: user.id,
        email: user.email || '',
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || user.id
      })));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  
  const createNotification = async () => {
    try {
      if (!title || !description || !type || !userId) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          description,
          type,
          category,
          read: false,
        });
      
      if (error) throw error;
      
      toast.success("Notification créée avec succès");
      setOpenCreateDialog(false);
      resetForm();
      fetchNotifications();
      
      // Log admin action
      await supabase.from('admin_logs').insert({
        action_type: 'create_notification',
        description: `Notification créée: ${title}`,
        target_user_id: userId
      });
      
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Erreur lors de la création de la notification");
    }
  };
  
  const updateNotification = async () => {
    try {
      if (!editingNotification || !title || !description || !type) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({
          title,
          description,
          type,
          category,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingNotification.id);
      
      if (error) throw error;
      
      toast.success("Notification mise à jour avec succès");
      setOpenEditDialog(false);
      resetForm();
      fetchNotifications();
      
      // Log admin action
      await supabase.from('admin_logs').insert({
        action_type: 'update_notification',
        description: `Notification mise à jour: ${title}`,
        target_user_id: editingNotification.user_id
      });
      
    } catch (error) {
      console.error("Error updating notification:", error);
      toast.error("Erreur lors de la mise à jour de la notification");
    }
  };
  
  const deleteNotification = async (id: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Notification supprimée avec succès");
      fetchNotifications();
      
      // Log admin action
      await supabase.from('admin_logs').insert({
        action_type: 'delete_notification',
        description: `Notification supprimée`,
        target_user_id: userId
      });
      
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Erreur lors de la suppression de la notification");
    }
  };
  
  const handleEditClick = (notification: Notification) => {
    setEditingNotification(notification);
    setTitle(notification.title);
    setDescription(notification.description);
    setType(notification.type);
    setCategory(notification.category || "info");
    setUserId(notification.user_id || "");
    setOpenEditDialog(true);
  };
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("marketing");
    setCategory("info");
    setUserId("");
    setEditingNotification(null);
  };
  
  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };
  
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : userId;
  };
  
  const getCategoryBadge = (category: NotificationCategory) => {
    switch(category) {
      case 'success':
        return <Badge className="bg-green-500">{category}</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">{category}</Badge>;
      case 'error':
        return <Badge className="bg-red-500">{category}</Badge>;
      case 'info':
      default:
        return <Badge className="bg-blue-500">{category}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <Helmet>
        <title>Gestion des Notifications | Admin BGS</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-bgs-blue">Gestion des Notifications</h1>
          <p className="text-gray-500">Créez et gérez les notifications destinées aux utilisateurs</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchNotifications}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nouvelle Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle notification</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="user">Destinataire</Label>
                  <Select value={userId} onValueChange={setUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Titre de la notification"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description détaillée de la notification"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={(value: NotificationType) => setType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type de notification" />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={category} onValueChange={(value: NotificationCategory) => setCategory(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenCreateDialog(false)}>Annuler</Button>
                <Button onClick={createNotification}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Modifier une notification</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Titre de la notification"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description détaillée de la notification"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={(value: NotificationType) => setType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type de notification" />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={category} onValueChange={(value: NotificationCategory) => setCategory(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Annuler</Button>
                <Button onClick={updateNotification}>Mettre à jour</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-bgs-blue border-t-transparent rounded-full"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucune notification</h3>
            <p className="text-gray-500 mt-1">
              Créez une nouvelle notification en cliquant sur le bouton "Nouvelle Notification"
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Destinataire</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-[300px] truncate" title={notification.title}>
                        {notification.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 max-w-[300px] truncate" title={notification.description}>
                        {notification.description}
                      </div>
                    </TableCell>
                    <TableCell>{getUserName(notification.user_id || "")}</TableCell>
                    <TableCell>{notification.type}</TableCell>
                    <TableCell>{getCategoryBadge(notification.category || "info")}</TableCell>
                    <TableCell>
                      {notification.read ? (
                        <Badge variant="outline" className="text-gray-500">Lu</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Non lu</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(notification.date)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditClick(notification)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteNotification(notification.id, notification.user_id || "")}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
