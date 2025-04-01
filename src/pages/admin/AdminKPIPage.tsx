
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChartBar, ChartPie, TrendingUp } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminKPIPage() {
  const { stats, isLoading, isRefreshing, refreshData } = useAdminDashboard();
  
  // Palette de couleurs pour les graphiques
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  // Préparer les données pour les graphiques
  const financialOverview = [
    { name: 'Soldes', value: stats.totalWalletBalance },
    { name: 'Investissements', value: stats.totalInvestments },
    { name: 'Retraits', value: stats.withdrawalRequestsAmount },
    { name: 'Virements', value: stats.receivedTransfersAmount },
  ];
  
  const projectDistribution = [
    { name: 'Projets en cours', value: stats.ongoingProjects },
    { name: 'Autres projets', value: stats.totalProjects - stats.ongoingProjects },
  ];
  
  const userActivity = [
    { name: 'Utilisateurs', value: stats.userCount },
    { name: 'Virements', value: stats.receivedTransfersCount },
    { name: 'Retraits', value: stats.withdrawalRequestsCount },
  ];

  // Simulation de données d'évolution sur 6 mois (à remplacer par des données réelles)
  const growthData = [
    { name: 'Jan', users: stats.userCount * 0.7, investments: stats.totalInvestments * 0.65 },
    { name: 'Fév', users: stats.userCount * 0.8, investments: stats.totalInvestments * 0.75 },
    { name: 'Mar', users: stats.userCount * 0.85, investments: stats.totalInvestments * 0.8 },
    { name: 'Avr', users: stats.userCount * 0.9, investments: stats.totalInvestments * 0.85 },
    { name: 'Mai', users: stats.userCount * 0.95, investments: stats.totalInvestments * 0.9 },
    { name: 'Juin', users: stats.userCount, investments: stats.totalInvestments },
  ];
  
  // Formatter pour les valeurs monétaires
  const formatEuro = (value: number) => `${value.toLocaleString()} €`;
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="px-4 py-8 md:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Analyse KPI</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {Array(4).fill(null).map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Analyse KPI | BGS Invest Admin</title>
      </Helmet>
      
      <AdminLayout>
        <div className="px-4 py-8 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Analyse KPI</h1>
              <p className="text-gray-500">Visualisation détaillée des indicateurs clés de performance</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData} 
              disabled={isRefreshing}
              className="mt-4 md:mt-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser les données
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar className="h-5 w-5 text-blue-600" />
                  Aperçu financier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={financialOverview}
                      margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatEuro(Number(value)), 'Montant']} />
                      <Legend />
                      <Bar dataKey="value" fill="#4f46e5" name="Montant (€)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartPie className="h-5 w-5 text-purple-600" />
                  Distribution des projets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {projectDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Nombre']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar className="h-5 w-5 text-green-600" />
                  Activité des utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={userActivity}
                      margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Nombre']} />
                      <Legend />
                      <Bar dataKey="value" fill="#10b981" name="Nombre" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  Évolution sur 6 mois
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={growthData}
                      margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'users') return [value, 'Utilisateurs'];
                        if (name === 'investments') return [formatEuro(Number(value)), 'Investissements'];
                        return [value, name];
                      }} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="users" stroke="#4f46e5" name="Utilisateurs" />
                      <Line yAxisId="right" type="monotone" dataKey="investments" stroke="#10b981" name="Investissements (€)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
