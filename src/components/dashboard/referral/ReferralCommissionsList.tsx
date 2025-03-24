
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReferralCommissions } from "../../../hooks/useReferralCommissions";
import { formatCurrency } from "@/utils/currencyUtils";
import { formatDate } from "@/utils/formatUtils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ReferralCommissionsList = () => {
  const { commissions, isLoading, error } = useReferralCommissions();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commissions de parrainage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 border-b">
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commissions de parrainage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-4 text-center">
            Une erreur est survenue lors du chargement des commissions
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!commissions || commissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commissions de parrainage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Vous n'avez pas encore reçu de commissions.</p>
            <p className="text-sm mt-2">
              Vous recevrez automatiquement 10% des rendements de vos filleuls.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commissions de parrainage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Filleul</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">
                    {formatDate(commission.created_at)}
                  </TableCell>
                  <TableCell>{commission.referredName || "Filleul"}</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {formatCurrency(commission.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={commission.status === 'completed' ? 'default' : 'outline'}>
                      {commission.status === 'completed' ? 'Créditée' : 'En attente'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralCommissionsList;
