
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ArrowDown, ArrowUp, Loader2, RefreshCw, Users, Database, Info } from "lucide-react";
import { formatDate } from "@/components/dashboard/tabs/wallet/withdrawal-table/formatUtils";
import { calculateInactivityTime } from "@/utils/inactivityCalculator";
import { toast } from "sonner";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wallet_balance: number | null;
  investment_total: number | null;
  projects_count: number | null;
  created_at: string | null;
  last_active_at: string | null;
  referral_code: string | null;
  address: string | null;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    fetchProfiles();

    // Set up real-time listener for the profiles table
    const profilesChannel = supabase
      .channel("profiles_changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "profiles"
      }, (payload) => {
        console.log("Profile change detected:", payload);
        fetchProfiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
    };
  }, [sortField, sortDirection]);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      
      // First get the total count - without any filters
      const { count, error: countError } = await supabase
        .from("profiles")
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error("Error getting count:", countError);
        throw countError;
      }
      
      setTotalCount(count || 0);
      console.log("Total profiles count:", count);
      
      // Then get all profiles - no limit
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      console.log("Profiles fetched:", data?.length);
      setProfiles(data || []);
      toast.success(`${data?.length || 0} profils chargés avec succès`);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Erreur lors du chargement des profils");
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

  const getStatusBadge = (lastActiveAt: string | null, createdAt: string | null) => {
    if (!lastActiveAt) return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Jamais connecté
      </span>
    );
    
    const lastActive = new Date(lastActiveAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Actif
        </span>
      );
    } else if (diffDays < 30) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Inactif récent
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Inactif
        </span>
      );
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (profile.first_name && profile.first_name.toLowerCase().includes(searchLower)) || 
      (profile.last_name && profile.last_name.toLowerCase().includes(searchLower)) || 
      (profile.email && profile.email.toLowerCase().includes(searchLower)) ||
      (profile.phone && profile.phone.toLowerCase().includes(searchLower)) ||
      (profile.referral_code && profile.referral_code.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Tous les Profils Utilisateurs</h1>
        
        <Card className="bg-white rounded-lg shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-gray-500" />
                <span>Liste de tous les profils ({totalCount})</span>
              </div>
              <Button 
                variant="outline"
                onClick={fetchProfiles}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  type="text" 
                  placeholder="Rechercher par nom, email, téléphone, code de parrainage..." 
                  className="pl-10 w-full" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
            </div>
            
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
              <Info className="h-4 w-4" />
              <span>Affichage de {filteredProfiles.length} profils sur {totalCount} au total</span>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                Aucun profil trouvé
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>
                        <button 
                          className="flex items-center space-x-1 hover:text-gray-700" 
                          onClick={() => handleSort("wallet_balance")}
                        >
                          <span>Solde</span>
                          {sortField === "wallet_balance" && (
                            sortDirection === "asc" ? 
                              <ArrowUp className="h-4 w-4" /> : 
                              <ArrowDown className="h-4 w-4" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button 
                          className="flex items-center space-x-1 hover:text-gray-700" 
                          onClick={() => handleSort("investment_total")}
                        >
                          <span>Total Investi</span>
                          {sortField === "investment_total" && (
                            sortDirection === "asc" ? 
                              <ArrowUp className="h-4 w-4" /> : 
                              <ArrowDown className="h-4 w-4" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button 
                          className="flex items-center space-x-1 hover:text-gray-700" 
                          onClick={() => handleSort("projects_count")}
                        >
                          <span>Projets</span>
                          {sortField === "projects_count" && (
                            sortDirection === "asc" ? 
                              <ArrowUp className="h-4 w-4" /> : 
                              <ArrowDown className="h-4 w-4" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button 
                          className="flex items-center space-x-1 hover:text-gray-700" 
                          onClick={() => handleSort("created_at")}
                        >
                          <span>Date d'inscription</span>
                          {sortField === "created_at" && (
                            sortDirection === "asc" ? 
                              <ArrowUp className="h-4 w-4" /> : 
                              <ArrowDown className="h-4 w-4" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>Inactivité</TableHead>
                      <TableHead>Code Parrainage</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{profile.first_name} {profile.last_name}</div>
                            <div className="text-sm text-gray-500">{profile.email}</div>
                            {profile.phone && (
                              <div className="text-xs text-gray-400">{profile.phone}</div>
                            )}
                            {profile.address && (
                              <div className="text-xs text-gray-400">{profile.address}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {profile.wallet_balance !== null ? 
                            `${profile.wallet_balance.toLocaleString()} €` : 
                            "0 €"
                          }
                        </TableCell>
                        <TableCell>
                          {profile.investment_total !== null ? 
                            `${profile.investment_total.toLocaleString()} €` : 
                            "0 €"
                          }
                        </TableCell>
                        <TableCell>
                          {profile.projects_count || 0}
                        </TableCell>
                        <TableCell>
                          {profile.created_at ? formatDate(profile.created_at) : "-"}
                        </TableCell>
                        <TableCell>
                          {calculateInactivityTime(profile.last_active_at, profile.created_at)}
                        </TableCell>
                        <TableCell>
                          {profile.referral_code || "-"}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(profile.last_active_at, profile.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
