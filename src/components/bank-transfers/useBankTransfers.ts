
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BankTransfer, UserData } from "./types";
import { toast } from "sonner";

export default function useBankTransfers() {
  const [isLoading, setIsLoading] = useState(true);
  const [bankTransfers, setBankTransfers] = useState<BankTransfer[]>([]);
  const [userData, setUserData] = useState<Record<string, UserData>>({});
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const fetchBankTransfers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching bank transfers...");
      
      const { data, error } = await supabase
        .from("bank_transfers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      console.log("Fetched bank transfers:", data?.length || 0);
      setBankTransfers(data || []);

      // Fetch user data for each unique user_id
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(transfer => transfer.user_id))];
        
        console.log("Fetching user profiles for IDs:", userIds);
        
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        } else {
          console.log("Fetched profiles:", profiles?.length || 0);
          
          // Map profiles by user ID for easier access
          const userDataMap: Record<string, UserData> = {};
          profiles?.forEach(profile => {
            userDataMap[profile.id] = {
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email
            };
          });
          
          setUserData(userDataMap);
        }
      }
    } catch (err: any) {
      console.error("Error fetching bank transfers:", err);
      setError(`Erreur lors du chargement des virements: ${err.message}`);
      toast.error("Erreur lors du chargement des virements bancaires");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBankTransfers();
  }, [fetchBankTransfers]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter transfers based on search term
  const filteredTransfers = bankTransfers.filter(transfer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const user = userData[transfer.user_id];
    
    return (
      // Search by reference
      transfer.reference?.toLowerCase().includes(searchLower) ||
      // Search by user name or email if available
      (user?.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
      (user?.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
      (user?.email && user.email.toLowerCase().includes(searchLower))
    );
  }).sort((a, b) => {
    if (!sortField) return 0;
    
    // Handle sorting based on field and direction
    const direction = sortDirection === "asc" ? 1 : -1;
    
    if (sortField === "user") {
      const userA = userData[a.user_id];
      const userB = userData[b.user_id];
      const nameA = `${userA?.last_name || ""} ${userA?.first_name || ""}`.trim().toLowerCase();
      const nameB = `${userB?.last_name || ""} ${userB?.first_name || ""}`.trim().toLowerCase();
      return nameA.localeCompare(nameB) * direction;
    }
    
    if (sortField === "amount") {
      return ((a.amount || 0) - (b.amount || 0)) * direction;
    }
    
    if (sortField === "date") {
      const dateA = a.confirmed_at ? new Date(a.confirmed_at).getTime() : 0;
      const dateB = b.confirmed_at ? new Date(b.confirmed_at).getTime() : 0;
      return (dateA - dateB) * direction;
    }
    
    if (sortField === "status") {
      return (a.status || "").localeCompare(b.status || "") * direction;
    }
    
    return 0;
  });

  return {
    isLoading,
    bankTransfers,
    userData,
    error,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    fetchBankTransfers,
    filteredTransfers
  };
}
