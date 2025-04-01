
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

const formSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères" }),
  description: z.string().min(10, { message: "La description doit contenir au moins 10 caractères" }),
  type: z.string(),
  category: z.string(),
  userId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateNotificationFormProps {
  notificationType: "marketing" | "custom";
  onSuccess?: () => void;
}

export default function CreateNotificationForm({ notificationType, onSuccess }: CreateNotificationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Array<{ id: string; email: string; fullName: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState<Array<{ id: string; email: string; fullName: string }>>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: notificationType,
      category: "info",
      userId: notificationType === "custom" ? "" : undefined,
    },
  });
  
  const searchUsers = async (query: string) => {
    if (!query || query.length < 3) return;
    
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);
      
      if (error) throw error;
      
      setUserSearchResults(data.map(user => ({
        id: user.id,
        email: user.email || "",
        fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Utilisateur sans nom"
      })));
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Erreur lors de la recherche d'utilisateurs");
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectUser = (user: { id: string; email: string; fullName: string }) => {
    setSelectedUsers([user]);
    form.setValue("userId", user.id);
    setUserSearchResults([]);
    setSearchQuery("");
  };
  
  const removeSelectedUser = () => {
    setSelectedUsers([]);
    form.setValue("userId", "");
  };
  
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // For marketing notifications, send to all users
      if (notificationType === "marketing") {
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id');
        
        if (usersError) throw usersError;
        
        // Create notifications for each user
        for (const user of users) {
          await createNotification({
            ...values,
            userId: user.id
          });
        }
        
        toast.success(`Notification marketing envoyée à ${users.length} utilisateurs`);
      } 
      // For custom notifications, send to selected user
      else if (values.userId) {
        await createNotification(values);
        toast.success("Notification personnalisée envoyée");
      } else {
        toast.error("Veuillez sélectionner un utilisateur");
        setIsSubmitting(false);
        return;
      }
      
      // Reset form and state
      form.reset();
      setSelectedUsers([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Erreur lors de l'envoi de la notification");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const createNotification = async (values: FormValues) => {
    const id = uuidv4();
    
    await supabase.from('notifications').insert({
      id,
      title: values.title,
      message: values.description,
      type: values.type,
      user_id: values.userId,
      created_at: new Date().toISOString(),
      seen: false,
      data: { category: values.category }
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Titre de la notification" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Contenu de la notification" 
                  className="min-h-[100px]" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="success">Succès</SelectItem>
                  <SelectItem value="warning">Avertissement</SelectItem>
                  <SelectItem value="error">Erreur</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {notificationType === "custom" && (
          <div className="space-y-2">
            <FormLabel>Destinataire</FormLabel>
            
            {selectedUsers.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map(user => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                  >
                    <span>{user.fullName}</span>
                    <button 
                      type="button" 
                      onClick={removeSelectedUser}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Rechercher un utilisateur"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchUsers(e.target.value);
                    }}
                  />
                  
                  {userSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {userSearchResults.map(user => (
                        <button
                          key={user.id}
                          type="button"
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => handleSelectUser(user)}
                        >
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {isSearching && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                  )}
                </div>
                
                {searchQuery && searchQuery.length < 3 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Tapez au moins 3 caractères pour lancer la recherche
                  </p>
                )}
              </>
            )}
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full mt-6" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Envoi en cours..." : "Envoyer la notification"}
        </Button>
      </form>
    </Form>
  );
}
