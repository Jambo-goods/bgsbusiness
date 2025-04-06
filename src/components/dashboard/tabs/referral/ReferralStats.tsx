
import React, { useEffect, useState } from "react";
import { referralService } from "@/services/referralService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";

export default function ReferralStats() {
  const [stats, setStats] = useState({
    referralsCount: 0,
    totalEarnings: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const statsData = await referralService.getReferralStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching referral stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes statistiques</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-bgs-orange"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-2xl font-bold text-blue-700">{stats.referralsCount}</span>
              <span className="text-sm text-blue-600">Filleuls</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-2xl font-bold text-green-700">{stats.totalEarnings} €</span>
              <span className="text-sm text-green-600">Gains totaux</span>
            </div>
          </div>
        )}
        <p className="text-sm text-gray-500 mt-4">
          Vous gagnez 25€ pour chaque filleul qui effectue un premier investissement
        </p>
      </CardContent>
    </Card>
  );
}
