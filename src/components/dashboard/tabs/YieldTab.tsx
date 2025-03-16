
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, Calendar, DollarSign, TrendingUp, PercentIcon, ChevronRight, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingIndicator from "./investment-tracking/LoadingIndicator";

interface YieldTabProps {
  userInvestments?: any[];
}

export default function YieldTab({ userInvestments = [] }: YieldTabProps) {
  const [timeRange, setTimeRange] = useState<"3months" | "6months" | "12months">("12months");
  
  // Sample data for yield projection
  const yieldData = [
    { month: 'Jan', expected: 250, received: 245 },
    { month: 'Feb', expected: 300, received: 290 },
    { month: 'Mar', expected: 280, received: 275 },
    { month: 'Apr', expected: 310, received: 305 },
    { month: 'May', expected: 350, received: 340 },
    { month: 'Jun', expected: 370, received: 0 }, // Future month
    { month: 'Jul', expected: 390, received: 0 }, // Future month
    { month: 'Aug', expected: 410, received: 0 }, // Future month
    { month: 'Sep', expected: 430, received: 0 }, // Future month
    { month: 'Oct', expected: 425, received: 0 }, // Future month
    { month: 'Nov', expected: 440, received: 0 }, // Future month
    { month: 'Dec', expected: 460, received: 0 }, // Future month
  ];
  
  // Filter data based on selected time range
  const filterDataByTimeRange = () => {
    switch (timeRange) {
      case "3months":
        return yieldData.slice(0, 3);
      case "6months":
        return yieldData.slice(0, 6);
      case "12months":
      default:
        return yieldData;
    }
  };
  
  const filteredData = filterDataByTimeRange();
  
  // Calculate totals
  const totalExpected = yieldData.reduce((sum, item) => sum + item.expected, 0);
  const totalReceived = yieldData.reduce((sum, item) => sum + item.received, 0);
  const totalPending = totalExpected - totalReceived;
  
  // Sample data for upcoming payments
  const upcomingPayments = [
    { 
      id: 1, 
      projectName: "Immeuble Résidentiel Paris", 
      date: "2023-06-15", 
      amount: 370, 
      status: "scheduled" 
    },
    { 
      id: 2, 
      projectName: "Centre Commercial Lyon", 
      date: "2023-07-01", 
      amount: 390, 
      status: "scheduled" 
    },
    { 
      id: 3, 
      projectName: "Complexe de Bureaux Bordeaux", 
      date: "2023-08-10", 
      amount: 410, 
      status: "scheduled" 
    },
    { 
      id: 4, 
      projectName: "Résidence Étudiante Toulouse", 
      date: "2023-09-05", 
      amount: 430, 
      status: "scheduled" 
    },
  ];

  // Safe access to userInvestments with default values
  const currentInvestments = userInvestments && userInvestments.length > 0 
    ? userInvestments.map(inv => ({
        id: inv.id || Math.random().toString(36),
        projects: {
          name: inv.projects?.name || "Projet sans nom",
          location: inv.projects?.location || "Localisation inconnue",
          yield: inv.projects?.expected_yield || 7.0,
          status: inv.status || "active"
        },
        amount: inv.amount || 0,
        duration: inv.duration || 36,
        startDate: inv.created_at || new Date().toISOString()
      }))
    : [
      {
        id: 1,
        projects: {
          name: "Immeuble Résidentiel Paris",
          location: "Paris",
          yield: 8.5,
          status: "active"
        },
        amount: 10000,
        duration: 36,
        startDate: "2023-01-15"
      },
      {
        id: 2,
        projects: {
          name: "Centre Commercial Lyon",
          location: "Lyon",
          yield: 7.2,
          status: "active"
        },
        amount: 15000,
        duration: 48,
        startDate: "2023-02-20"
      },
      {
        id: 3,
        projects: {
          name: "Complexe de Bureaux Bordeaux",
          location: "Bordeaux",
          yield: 6.8,
          status: "active"
        },
        amount: 8000,
        duration: 24,
        startDate: "2023-03-10"
      }
    ];

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    } catch (e) {
      return "Date invalide";
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-600";
      case "scheduled":
        return "bg-blue-100 text-blue-600";
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Projections de Rendement</h1>
          <p className="text-gray-500 mt-1">Suivi et projection des rendements de vos investissements</p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button 
            size="sm" 
            variant={timeRange === "3months" ? "default" : "outline"}
            onClick={() => setTimeRange("3months")}
          >
            3 mois
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === "6months" ? "default" : "outline"}
            onClick={() => setTimeRange("6months")}
          >
            6 mois
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === "12months" ? "default" : "outline"}
            onClick={() => setTimeRange("12months")}
          >
            12 mois
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 flex items-center">
                <ArrowUpRight className="mr-1 h-4 w-4 text-blue-500" />
                Rendement Total Attendu
              </p>
              <p className="text-2xl font-semibold mt-1">{totalExpected} €</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>
        
        <Card className="p-5 border-l-4 border-green-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 flex items-center">
                <DollarSign className="mr-1 h-4 w-4 text-green-500" />
                Rendement Perçu
              </p>
              <p className="text-2xl font-semibold mt-1">{totalReceived} €</p>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <PercentIcon className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>
        
        <Card className="p-5 border-l-4 border-yellow-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="mr-1 h-4 w-4 text-yellow-500" />
                Rendement En Attente
              </p>
              <p className="text-2xl font-semibold mt-1">{totalPending} €</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Chart Section - Removed the div with className="p-6" as requested */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 p-4">Projection des Rendements sur {timeRange === "3months" ? "3" : timeRange === "6months" ? "6" : "12"} mois</h2>
        <div className="h-80 px-4 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} €`, '']}
                labelFormatter={(label) => `Mois: ${label}`}
              />
              <Legend />
              <Bar 
                name="Rendement Attendu" 
                dataKey="expected" 
                fill="#3b82f6" 
              />
              <Bar 
                name="Rendement Perçu" 
                dataKey="received" 
                fill="#22c55e" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Current Investments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Investissements Actuels</h2>
          <Button variant="outline" size="sm" className="flex items-center">
            Voir tout <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentInvestments.map((investment) => (
            <Card key={investment.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800 line-clamp-1">{investment.projects.name}</h3>
                  <Badge className={`${
                    investment.projects.status === "active" 
                      ? "bg-green-100 text-green-600" 
                      : "bg-blue-100 text-blue-600"
                  }`}>
                    {investment.projects.status === "active" ? "Actif" : "En cours"}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-500 mb-3">{investment.projects.location}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Montant investi</span>
                    <span className="font-medium">{investment.amount} €</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rendement</span>
                    <span className="font-medium text-green-600">{investment.projects.yield}%</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date de début</span>
                    <span className="font-medium">{formatDate(investment.startDate)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Durée</span>
                    <span className="font-medium">{investment.duration} mois</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Upcoming Payments Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Prochains Versements</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Projet</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Montant</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {upcomingPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{payment.projectName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(payment.date)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{payment.amount} €</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status === "completed" ? "Complété" : 
                       payment.status === "scheduled" ? "Prévu" : "En attente"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
