
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, BellRing, Settings, Info, AlertTriangle, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/services/notifications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  seen: boolean;
  data?: any;
};

const NotificationsTab = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, (payload) => {
        console.log('New notification received:', payload);
        
        // Add new notification to state
        setNotifications(prev => [payload.new as Notification, ...prev]);
        
        // Show toast notification
        toast.info('Nouvelle notification', {
          description: (payload.new as Notification).title
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Get current user's session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        toast.error('Erreur', { description: 'Vous devez être connecté pour voir vos notifications' });
        return;
      }
      
      console.log('Fetching notifications for user:', userId);
      
      // Fetch notifications for the current user
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Erreur', { description: 'Impossible de charger les notifications' });
        return;
      }
      
      console.log('Fetched notifications:', data);
      setNotifications(data || []);
      
      // Mark notifications as seen
      if (data && data.length > 0) {
        const unseenIds = data
          .filter(notification => !notification.seen)
          .map(notification => notification.id);
        
        if (unseenIds.length > 0) {
          await supabase
            .from('notifications')
            .update({ seen: true })
            .in('id', unseenIds);
        }
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      toast.error('Erreur', { description: 'Une erreur est survenue' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'investment': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'withdrawal': return <Clock className="h-5 w-5 text-amber-500" />;
      case 'deposit': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'yield': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-bgs-blue" />;
    }
  };
  
  const getStatusBadge = (type: string) => {
    const statusLabels = {
      investment: "Investissement",
      withdrawal: "Retrait",
      deposit: "Dépôt",
      info: "Information",
      warning: "Avertissement",
      error: "Erreur",
      yield: "Rendement"
    };

    const statusColors = {
      investment: "bg-green-100 text-green-800",
      withdrawal: "bg-amber-100 text-amber-800",
      deposit: "bg-blue-100 text-blue-800",
      info: "bg-blue-100 text-blue-800",
      warning: "bg-amber-100 text-amber-800",
      error: "bg-red-100 text-red-800",
      yield: "bg-green-100 text-green-800"
    };

    const label = statusLabels[type as keyof typeof statusLabels] || "Information";
    const colorClass = statusColors[type as keyof typeof statusColors] || "bg-blue-100 text-blue-800";

    return (
      <Badge variant="outline" className={`${colorClass} border-0`}>
        {label}
      </Badge>
    );
  };
  
  // Filter notifications based on active category
  const filteredNotifications = notifications.filter(notification => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'investments' && notification.type === 'investment') return true;
    if (activeCategory === 'deposits' && 
        (notification.type === 'deposit' || notification.type === 'withdrawal')) return true;
    if (activeCategory === 'yields' && notification.type === 'yield') return true;
    if (activeCategory === 'opportunities' && notification.type === 'opportunity') return true;
    return false;
  });
  
  // État pour indiquer qu'il n'y a pas de notifications
  const emptyState = (
    <div className="text-center py-8">
      <BellRing className="h-10 w-10 text-gray-300 mx-auto mb-2" />
      <p className="text-gray-500">Aucune notification pour le moment</p>
    </div>
  );
  
  const renderNotificationsList = (notifications: Notification[]) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <RefreshCw className="h-6 w-6 text-bgs-blue animate-spin" />
          <span className="ml-2">Chargement des notifications...</span>
        </div>
      );
    }
    
    if (notifications.length === 0) {
      return emptyState;
    }
    
    return (
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className="flex items-start p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="mr-3 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-bgs-blue">{notification.title}</h4>
                {getStatusBadge(notification.type)}
              </div>
              <p className="text-gray-600 text-sm">{notification.message}</p>
              <p className="text-gray-400 text-xs mt-1">
                {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-bgs-blue">Notifications</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="investments">Investissements</TabsTrigger>
          <TabsTrigger value="deposits">Dépôts & Retraits</TabsTrigger>
          <TabsTrigger value="yields">Rendements</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">Toutes les notifications</CardTitle>
                <CardDescription>Consultez l'ensemble de vos notifications</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {renderNotificationsList(filteredNotifications)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="investments" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Confirmations d'investissements</CardTitle>
              <CardDescription>Notifications relatives à vos investissements</CardDescription>
            </CardHeader>
            <CardContent>
              {renderNotificationsList(filteredNotifications)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deposits" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Dépôts et retraits</CardTitle>
              <CardDescription>Notifications relatives à vos opérations financières</CardDescription>
            </CardHeader>
            <CardContent>
              {renderNotificationsList(filteredNotifications)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="yields" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Rendements reçus</CardTitle>
              <CardDescription>Notifications relatives aux rendements de vos investissements</CardDescription>
            </CardHeader>
            <CardContent>
              {renderNotificationsList(filteredNotifications)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="opportunities" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Opportunités d'investissement</CardTitle>
              <CardDescription>Nouvelles opportunités d'investissement disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              {renderNotificationsList(filteredNotifications)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="text-bgs-blue h-5 w-5" />
            Préférences de notification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Personnalisez les notifications que vous souhaitez recevoir:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-bgs-blue" />
                <span>Confirmations d'investissements</span>
              </div>
              <Button variant="outline" size="sm">Activé</Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-bgs-blue" />
                <span>Dépôts et retraits</span>
              </div>
              <Button variant="outline" size="sm">Activé</Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-bgs-blue" />
                <span>Rendements reçus</span>
              </div>
              <Button variant="outline" size="sm">Activé</Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-bgs-blue" />
                <span>Nouvelles opportunités d'investissement</span>
              </div>
              <Button variant="outline" size="sm">Activé</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab;
