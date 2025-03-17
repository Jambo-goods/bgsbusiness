
import React, { useState } from 'react';
import { useScheduledPayments } from '@/hooks/useScheduledPayments';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Toaster } from 'sonner';
import { Check, Clock, AlertCircle, Filter, ArrowUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from '@/layouts/DashboardLayout';

const ScheduledPaymentsPage = () => {
  const { scheduledPayments, isLoading, error } = useScheduledPayments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('date'); // 'date', 'amount', 'project'
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '—';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Check className="h-4 w-4 mr-2 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 mr-2 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />;
    }
  };

  // Format status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payé';
      case 'pending':
        return 'En attente';
      case 'scheduled':
        return 'Programmé';
      default:
        return status;
    }
  };

  // Filter and sort payments
  const filteredPayments = scheduledPayments.filter(payment => {
    // Filter by search term
    const projectName = payment.projects?.name?.toLowerCase() || '';
    const matchesSearch = searchTerm === '' || projectName.includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(payment.status);
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort functionality
    if (sortBy === 'date') {
      const dateA = new Date(a.payment_date || '').getTime();
      const dateB = new Date(b.payment_date || '').getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'amount') {
      const amountA = a.total_scheduled_amount || 0;
      const amountB = b.total_scheduled_amount || 0;
      return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
    } else if (sortBy === 'project') {
      const nameA = a.projects?.name || '';
      const nameB = b.projects?.name || '';
      return sortOrder === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }
    return 0;
  });

  // Toggle sort order
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-red-500 text-center">
            <h2 className="text-xl font-bold">Erreur</h2>
            <p>{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <Toaster />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Paiements Programmés</h1>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes('paid')}
                  onCheckedChange={(checked) => {
                    setStatusFilter(prev => 
                      checked 
                        ? [...prev, 'paid'] 
                        : prev.filter(s => s !== 'paid')
                    );
                  }}
                >
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Payé
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes('pending')}
                  onCheckedChange={(checked) => {
                    setStatusFilter(prev => 
                      checked 
                        ? [...prev, 'pending'] 
                        : prev.filter(s => s !== 'pending')
                    );
                  }}
                >
                  <Clock className="h-4 w-4 mr-2 text-orange-500" />
                  En attente
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes('scheduled')}
                  onCheckedChange={(checked) => {
                    setStatusFilter(prev => 
                      checked 
                        ? [...prev, 'scheduled'] 
                        : prev.filter(s => s !== 'scheduled')
                    );
                  }}
                >
                  <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
                  Programmé
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Sort Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Trier
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Trier par</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={sortBy === 'date'}
                  onCheckedChange={() => toggleSort('date')}
                >
                  Date de paiement
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === 'amount'}
                  onCheckedChange={() => toggleSort('amount')}
                >
                  Montant
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === 'project'}
                  onCheckedChange={() => toggleSort('project')}
                >
                  Nom du projet
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-gray-500">
                  Ordre: {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={sortOrder === 'asc'}
                  onCheckedChange={() => setSortOrder('asc')}
                >
                  Croissant
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortOrder === 'desc'}
                  onCheckedChange={() => setSortOrder('desc')}
                >
                  Décroissant
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Projet</TableHead>
                  <TableHead>Date de paiement</TableHead>
                  <TableHead>Montant total</TableHead>
                  <TableHead>Pourcentage</TableHead>
                  <TableHead>Nombre d'investisseurs</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      Aucun paiement programmé trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {payment.projects?.image && (
                            <img 
                              src={payment.projects.image} 
                              alt={payment.projects?.name || 'Projet'} 
                              className="w-8 h-8 rounded-full mr-2 object-cover"
                            />
                          )}
                          <span>{payment.projects?.name || 'Projet inconnu'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.payment_date 
                          ? format(new Date(payment.payment_date), 'dd/MM/yyyy') 
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(payment.total_scheduled_amount)}
                      </TableCell>
                      <TableCell>
                        {payment.percentage !== null ? `${payment.percentage}%` : '—'}
                      </TableCell>
                      <TableCell>
                        {payment.investors_count || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : payment.status === 'pending'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {getStatusLabel(payment.status)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ScheduledPaymentsPage;
