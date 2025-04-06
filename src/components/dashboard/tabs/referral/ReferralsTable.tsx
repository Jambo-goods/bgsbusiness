
import React, { useEffect, useState } from "react";
import { referralService, Referral } from "@/services/referralService";
import { Check, Clock, AlertCircle, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ReferralsTableProps {
  filter: "all" | "active" | "pending";
}

export default function ReferralsTable({ filter }: ReferralsTableProps) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      setIsLoading(true);
      try {
        const data = await referralService.getReferrals();
        setReferrals(data);
      } catch (error) {
        console.error("Error fetching referrals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReferrals();
  }, []);

  const filteredReferrals = referrals.filter(referral => {
    if (filter === "all") return true;
    if (filter === "active") return referral.referrer_rewarded;
    if (filter === "pending") return !referral.referrer_rewarded;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bgs-orange"></div>
      </div>
    );
  }

  if (filteredReferrals.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <Users className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">Aucun filleul {filter === "active" ? "actif" : filter === "pending" ? "en attente" : ""}</h3>
        <p className="text-gray-500">
          {filter === "all" ? (
            "Partagez votre lien de parrainage pour commencer à gagner des récompenses"
          ) : filter === "active" ? (
            "Vos filleuls n'ont pas encore effectué d'investissement"
          ) : (
            "Aucun filleul en attente actuellement"
          )}
        </p>
      </div>
    );
  }

  return (
    <Table className="border rounded-lg">
      <TableHeader>
        <TableRow>
          <TableHead>Filleul</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Récompense</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredReferrals.map((referral) => (
          <TableRow key={referral.id}>
            <TableCell>
              <div className="font-medium">
                {referral.referred_user?.first_name} {referral.referred_user?.last_name || ''}
              </div>
              <div className="text-xs text-gray-500">
                {referral.referred_user?.email || 'Email non disponible'}
              </div>
            </TableCell>
            <TableCell>
              {new Date(referral.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </TableCell>
            <TableCell>
              {referral.referrer_rewarded ? (
                <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center w-fit">
                  <Check className="h-3 w-3 mr-1" />
                  Actif
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center w-fit">
                  <Clock className="h-3 w-3 mr-1" />
                  En attente
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              {referral.referrer_rewarded ? (
                <span className="text-green-600 font-medium">25€</span>
              ) : (
                <span className="text-amber-600">En attente</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
