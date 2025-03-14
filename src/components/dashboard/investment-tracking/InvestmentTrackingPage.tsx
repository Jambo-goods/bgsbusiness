
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Building, Calendar, ChevronLeft, Download, MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

// Define the investment type to fix TypeScript errors
interface Investment {
  amount: number;
  date: string;
  duration: number;
  end_date: string;
  id: string;
  project_id: string;
  status: string;
  user_id: string;
  yield_rate: number;
  remainingDuration?: number;
  projects: {
    name: string;
    description: string;
    category: string;
    status: string;
    image: string;
    funding_progress: number;
    yield: number;
  };
}

export default function InvestmentTrackingPage() {
  const { investmentId } = useParams();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchInvestmentDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch investment with project details
        const { data, error } = await supabase
          .from("investments")
          .select(`
            *,
            projects (
              name,
              description,
              category,
              status,
              image,
              funding_progress,
              yield
            )
          `)
          .eq("id", investmentId)
          .single();
          
        if (error) throw error;
        
        // Calculate remaining duration
        if (data) {
          const investmentData = {...data} as Investment;
          const startDate = new Date(investmentData.date);
          const endDate = new Date(startDate.setMonth(startDate.getMonth() + investmentData.duration));
          const remainingMonths = Math.max(0, Math.floor((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
          investmentData.remainingDuration = remainingMonths;
          setInvestment(investmentData);
        }
        
        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from("wallet_transactions")
          .select("*")
          .eq("user_id", data.user_id)
          .order("created_at", { ascending: false });
          
        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData || []);
        
      } catch (error) {
        console.error("Error fetching investment details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (investmentId) {
      fetchInvestmentDetails();
    }
  }, [investmentId]);
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bgs-blue"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!investment) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Investissement non trouvé</div>
      </DashboardLayout>
    );
  }
  
  const totalEarnings = transactions
    .filter(t => t.type === 'yield' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Add Dashboard Header */}
        <DashboardHeader 
          userData={{ 
            firstName: "Investisseur", 
            lastName: "BGS" 
          }} 
        />
      
        <Link to="/dashboard" className="flex items-center text-bgs-blue hover:text-bgs-blue-light mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour au tableau de bord
        </Link>
        
        {/* Section 1: General Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-start gap-4">
                <img 
                  src={investment.projects.image} 
                  alt={investment.projects.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-bgs-blue">{investment.projects.name}</h2>
                  <p className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-1" />
                    {investment.projects.category}
                  </p>
                  <p className="text-sm text-gray-600">{investment.projects.description}</p>
                </div>
              </div>
              
              <Progress value={investment.projects.funding_progress} className="h-2" />
              <p className="text-sm text-gray-600">Progression : {investment.projects.funding_progress}%</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Section 2: Personal Investment Information */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Montant investi</p>
                <p className="text-3xl font-bold text-bgs-blue">{investment.amount}€</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Durée restante</p>
                <p className="text-3xl font-bold text-bgs-blue">{investment.remainingDuration} mois</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total des bénéfices reçus</p>
                <p className="text-3xl font-bold text-green-600">{totalEarnings}€</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Section 3: Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>{transaction.type === 'yield' ? 'Gain reçu' : 'Investissement'}</TableCell>
                    <TableCell className={transaction.type === 'yield' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'yield' ? '+' : '-'}{transaction.amount}€
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'completed' ? '✓ Confirmé' : '⏳ En attente'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Section 4: Project Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Suivi du projet en temps réel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Progression des travaux</h4>
                <Progress value={75} className="h-2 mb-4" />
                <p className="text-sm text-gray-600">Le projet avance selon le planning prévu.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Documents disponibles</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Rapport mensuel - Mars 2024
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Section 5: Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Actions disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contacter l'équipe du projet
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
