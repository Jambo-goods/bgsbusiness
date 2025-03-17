
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BankTransfer, UserData } from "./types";

export default function useBankTransfers() {
  const [bankTransfers, setBankTransfers] = useState<BankTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("confirmed_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [userData, setUserData] = useState<Record<string, UserData>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("BankTransfersPage mounted, fetching data...");
    fetchBankTransfers();

    // Set up real-time listener for the bank_transfers table
    const bankTransferChannel = supabase
      .channel("bank_transfers_changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "bank_transfers"
      }, (payload) => {
        console.log("Bank transfer change detected:", payload);
        fetchBankTransfers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bankTransferChannel);
    };
  }, [sortField, sortDirection]);

  const fetchBankTransfers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching bank transfers...");
      
      const { data, error } = await supabase
        .from("bank_transfers")
        .select("*")
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) {
        console.error("Error fetching bank transfers:", error);
        setError(`Erreur: ${error.message}`);
        toast.error("Erreur lors du chargement des virements");
        throw error;
      }

      console.log("Bank transfers fetched:", data);
      const transfersData = data || [];
      setBankTransfers(transfersData as BankTransfer[]);

      // Fetch user data for all transfers
      const userIds = Array.from(new Set(transfersData.map(t => t.user_id)));
      if (userIds.length > 0) {
        const { data: users, error: userError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", userIds);

        if (userError) {
          console.error("Error fetching user data:", userError);
          throw userError;
        }

        const userMap: Record<string, UserData> = {};
        users?.forEach(user => {
          userMap[user.id] = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
          };
        });
        setUserData(userMap);
      }
    } catch (error) {
      console.error("Error in fetchBankTransfers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredTransfers = bankTransfers.filter(transfer => {
    const searchLower = searchTerm.toLowerCase();
    const user = userData[transfer.user_id] || { first_name: null, last_name: null, email: null };
    const userName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    const userEmail = (user.email || "").toLowerCase();
    
    return userName.includes(searchLower) || 
           userEmail.includes(searchLower) || 
           transfer.reference.toLowerCase().includes(searchLower) ||
           (transfer.amount && String(transfer.amount).includes(searchTerm));
  });

  return {
    bankTransfers,
    filteredTransfers,
    isLoading,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    userData,
    error,
    handleSort,
    fetchBankTransfers
  };
}
