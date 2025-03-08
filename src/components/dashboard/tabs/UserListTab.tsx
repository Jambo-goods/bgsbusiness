
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle, Euro, Calendar, Mail, Clock } from "lucide-react";
import { toast } from "sonner";

type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  wallet_balance: number | null;
  investment_total: number | null;
  created_at: string | null;
}

export default function UserListTab() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all profiles from the database
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        console.log("Fetched users:", data);
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Impossible de charger les utilisateurs. Veuillez réessayer plus tard.");
        toast.error("Erreur de chargement", {
          description: "Impossible de récupérer la liste des utilisateurs."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-bgs-blue">Liste des Utilisateurs</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-bgs-blue">Liste des Utilisateurs</h2>
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          <p>{error}</p>
          <button 
            className="text-bgs-blue mt-2 underline"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-bgs-blue">Liste des Utilisateurs</h2>
      
      {users.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-md text-center">
          <UserCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Aucun utilisateur trouvé</h3>
          <p className="text-gray-500 mt-1">La base de données ne contient aucun profil utilisateur.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Solde Portefeuille</TableHead>
                  <TableHead>Total Investi</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-gray-500" />
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : "Utilisateur sans nom"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        {user.email || "Email non disponible"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-gray-500" />
                        {user.wallet_balance !== null 
                          ? `${user.wallet_balance.toLocaleString()} €`
                          : "0 €"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {user.investment_total !== null 
                          ? `${user.investment_total.toLocaleString()} €`
                          : "0 €"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {user.created_at 
                          ? new Date(user.created_at).toLocaleDateString('fr-FR')
                          : "Date inconnue"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
