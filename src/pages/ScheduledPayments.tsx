
import React, { useState, useEffect } from 'react';
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
import { Check, Clock, AlertCircle, ChevronDown, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Link } from 'react-router-dom';

const ScheduledPaymentsPage = () => {
  const { scheduledPayments, isLoading, error } = useScheduledPayments();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'payment_date', direction: 'desc' });
  const [filteredPayments, setFilteredPayments] = useState([]);
  
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

  // Apply filters and sorting
  useEffect(() => {
    if (!scheduledPayments) {
      setFilteredPayments([]);
      return;
    }

    let result = [...scheduledPayments];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        payment =>
          payment.projects?.name?.toLowerCase().includes(query) || 
          (payment.total_scheduled_amount?.toString() || '').includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(payment => payment.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'payment_date') {
        const dateA = new Date(a.payment_date || 0).getTime();
        const dateB = new Date(b.payment_date || 0).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (sortConfig.key === 'total_scheduled_amount') {
        const amountA = a.total_scheduled_amount || 0;
        const amountB = b.total_scheduled_amount || 0;
        return sortConfig.direction === 'asc' ? amountA - amountB : amountB - amountA;
      }
      
      if (sortConfig.key === 'project_name') {
        const nameA = a.projects?.name || '';
        const nameB = b.projects?.name || '';
        return sortConfig.direction === 'asc' 
          ? nameA.localeCompare(nameB) 
          : nameB.localeCompare(nameA);
      }
      
      if (sortConfig.key === 'percentage') {
        const percentA = a.percentage || 0;
        const percentB = b.percentage || 0;
        return sortConfig.direction === 'asc' ? percentA - percentB : percentB - percentA;
      }
      
      return 0;
    });

    setFilteredPayments(result);
  }, [scheduledPayments, searchQuery, statusFilter, sortConfig]);

  // Handle sort change
  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold">Erreur</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Independent Navigation Menu */}
      <div className="bg-white shadow mb-6">
        <div className="container mx-auto px-4">
          <NavigationMenu className="py-4">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/" className="font-bold text-xl hover:text-blue-500">
                    Finance App
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>Navigation</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[400px] gap-3 p-4">
                    <NavigationMenuLink asChild>
                      <Link to="/dashboard" className="flex items-center space-x-2 hover:bg-gray-100 rounded p-2">
                        <span>Dashboard</span>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/projects" className="flex items-center space-x-2 hover:bg-gray-100 rounded p-2">
                        <span>Projets</span>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/scheduled-payments" className="flex items-center space-x-2 bg-gray-100 rounded p-2 font-medium">
                        <span>Paiements Programmés</span>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Paiements Programmés</h1>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('all')} className={statusFilter === 'all' ? 'bg-gray-100' : ''}>
                  Tous
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('paid')} className={statusFilter === 'paid' ? 'bg-gray-100' : ''}>
                  Payé
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')} className={statusFilter === 'pending' ? 'bg-gray-100' : ''}>
                  En attente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('scheduled')} className={statusFilter === 'scheduled' ? 'bg-gray-100' : ''}>
                  Programmé
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Trier
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Trier par</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSort('payment_date')} className={sortConfig.key === 'payment_date' ? 'bg-gray-100' : ''}>
                  Date {sortConfig.key === 'payment_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('total_scheduled_amount')} className={sortConfig.key === 'total_scheduled_amount' ? 'bg-gray-100' : ''}>
                  Montant {sortConfig.key === 'total_scheduled_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('project_name')} className={sortConfig.key === 'project_name' ? 'bg-gray-100' : ''}>
                  Projet {sortConfig.key === 'project_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('percentage')} className={sortConfig.key === 'percentage' ? 'bg-gray-100' : ''}>
                  Pourcentage {sortConfig.key === 'percentage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
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
    </div>
  );
};

export default ScheduledPaymentsPage;
