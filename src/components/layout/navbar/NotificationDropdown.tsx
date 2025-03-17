import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  created_at: string;
  type: string;
  message: string;
  read: boolean;
  user_id: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();

    // Set up real-time listener for the notifications table
    const notificationChannel = supabase
      .channel("notifications_changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "notifications"
      }, (payload) => {
        console.log("Notification change detected:", payload);
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        setError(`Error: ${error.message}`);
        return;
      }

      setNotifications(data as Notification[]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("An error occurred while fetching notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) {
        console.error("Error marking notification as read:", error);
        toast({
          title: "Error",
          description: "Failed to mark notification as read.",
          variant: "destructive"
        });
        return;
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );

      toast({
        title: "Success",
        description: "Notification marked as read."
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive"
      });
    }
  };

  const handleClearAll = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId);

      if (error) {
        console.error("Error clearing all notifications:", error);
        toast({
          title: "Error",
          description: "Failed to clear all notifications.",
          variant: "destructive"
        });
        return;
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );

      toast({
        title: "Success",
        description: "All notifications cleared."
      });
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      toast({
        title: "Error",
        description: "Failed to clear all notifications.",
        variant: "destructive"
      });
    }
  };

  const unreadNotifications = notifications.filter(notification => !notification.read);
  const hasUnreadNotifications = unreadNotifications.length > 0;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 data-[state=open]:bg-muted">
          <Bell className="h-4 w-4" />
          {hasUnreadNotifications ? (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[300px] flex-1">
          {isLoading ? (
            <div className="grid h-20 place-items-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="grid h-20 place-items-center">
              <div>No notifications</div>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-center space-x-2"
                onClick={() => markAsRead(notification.id)}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://avatar.vercel.sh/${notification.user_id}.png`} alt={notification.user_id} />
                  <AvatarFallback>{notification.user_id.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <time className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </time>
                </div>
                {!notification.read && (
                  <CheckCheck className="ml-auto h-4 w-4 text-blue-500" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleClearAll("user-id")} className="justify-center">
          Clear All
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
