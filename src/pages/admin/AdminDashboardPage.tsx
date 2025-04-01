import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import AdminKPIStats from "@/components/admin/dashboard/AdminKPIStats";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";

export default function AdminDashboardPage() {
  const { stats, isLoading, isRefreshing, refreshData } = useAdminDashboard();
  
  return (
    <>
      <Helmet>
        <title>Tableau de bord administrateur | BGS Invest</title>
      </Helmet>
      
      <AdminLayout>
        <div className="px-4 py-8 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Tableau de bord administrateur</h1>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData} 
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
          
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <AdminKPIStats stats={stats} isLoading={isLoading} />
              
              <h2 className="text-xl font-semibold mb-4 mt-8">Statistiques générales</h2>
              <DashboardStats stats={stats} isLoading={isLoading} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Transactions récentes</CardTitle>
                    <CardDescription>Les 5 dernières transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentTransactions.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">Aucune transaction récente</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentTransactions.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell>
                                {tx.created_at 
                                  ? new Date(tx.created_at).toLocaleDateString('fr-FR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    }) 
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {tx.profiles 
                                  ? tx.profiles.first_name 
                                  : 'Utilisateur inconnu'}
                              </TableCell>
                              <TableCell className="font-medium">
                                {tx.amount} €
                              </TableCell>
                              <TableCell>
                                <Badge className={tx.type === 'deposit' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'}
                                >
                                  {tx.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={tx.status} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    <div className="mt-4 text-right">
                      <Link to="/admin/transactions">
                        <Button variant="link" size="sm">Voir toutes les transactions</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recent Users */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nouveaux utilisateurs</CardTitle>
                    <CardDescription>Les 5 derniers utilisateurs inscrits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentUsers.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">Aucun utilisateur récent</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Solde</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                {user.created_at 
                                  ? new Date(user.created_at).toLocaleDateString('fr-FR') 
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="font-medium">
                                {user.first_name} {user.last_name}
                              </TableCell>
                              <TableCell>
                                {user.email}
                              </TableCell>
                              <TableCell>
                                {user.wallet_balance || 0} €
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    <div className="mt-4 text-right">
                      <Link to="/admin/users">
                        <Button variant="link" size="sm">Voir tous les utilisateurs</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
