import React, { useState, useEffect } from 'react';
import { useScheduledPayments } from '@/hooks/useScheduledPayments';
import { supabase } from '@/integrations/supabase/client';
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
import { Check, Clock, AlertCircle, ChevronDown, Search, Filter, ArrowUpDown, Plus, Pencil } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const ScheduledPaymentsPage = () => {
  const { scheduledPayments, isLoading, error, addScheduledPayment, updatePaymentStatus } = useScheduledPayments();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'payment_date', direction: 'desc' });
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, company_name')
          .order('name');
          
        if (error) throw error;
        setAvailableProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        toast.error('Erreur lors du chargement des projets');
      }
    };
    
    fetchProjects();
  }, []);

  const form = useForm({
    defaultValues: {
      project_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      status: 'scheduled',
      percentage: 0,
      total_scheduled_amount: 0
    }
  });

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '—';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

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

  useEffect(() => {
    if (!scheduledPayments) {
      setFilteredPayments([]);
      return;
    }

    let result = [...scheduledPayments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        payment =>
          payment.projects?.name?.toLowerCase().includes(query) || 
          (payment.total_scheduled_amount?.toString() || '').includes(query)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(payment => payment.status === statusFilter);
    }

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

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    form.reset({
      project_id: payment.project_id,
      payment_date: payment.payment_date,
      status: payment.status,
      percentage: payment.percentage || 0,
      total_scheduled_amount: payment.total_scheduled_amount || 0
    });
    setIsAddPaymentOpen(true);
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    form.reset({
      project_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      status: 'scheduled',
      percentage: 0,
      total_scheduled_amount: 0
    });
    setIsAddPaymentOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingPayment) {
        await updatePaymentStatus(editingPayment.id, data.status);
        toast.success('Paiement mis à jour avec succès');
      } else {
        await addScheduledPayment({
          project_id: data.project_id,
          payment_date: data.payment_date,
          status: data.status,
          percentage: parseFloat(data.percentage) || 0,
          total_scheduled_amount: parseFloat(data.total_scheduled_amount) || 0,
          processed_at: null,
          investors_count: 0,
          total_invested_amount: null
        });
        toast.success('Paiement programmé avec succès');
      }
      setIsAddPaymentOpen(false);
    } catch (err) {
      console.error('Error saving payment:', err);
      toast.error(`Erreur: ${err.message || 'Une erreur est survenue'}`);
    }
  };

  const handleChangeStatus = async (paymentId, newStatus) => {
    try {
      await updatePaymentStatus(paymentId, newStatus);
      toast.success(`Statut mis à jour: ${getStatusLabel(newStatus)}`);
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(`Erreur: ${err.message || 'Une erreur est survenue'}`);
    }
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
            <Button 
              onClick={handleAddPayment}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un paiement
            </Button>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
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
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-gray-500">
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditPayment(payment)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8">
                                Statut <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleChangeStatus(payment.id, 'pending')}
                                className={payment.status === 'pending' ? 'bg-orange-50' : ''}
                              >
                                <Clock className="h-4 w-4 mr-2 text-orange-500" />
                                En attente
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleChangeStatus(payment.id, 'scheduled')}
                                className={payment.status === 'scheduled' ? 'bg-blue-50' : ''}
                              >
                                <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
                                Programmé
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleChangeStatus(payment.id, 'paid')}
                                className={payment.status === 'paid' ? 'bg-green-50' : ''}
                              >
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                                Payé
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
      
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPayment ? 'Modifier le paiement' : 'Ajouter un paiement programmé'}</DialogTitle>
            <DialogDescription>
              {editingPayment 
                ? 'Modifiez les détails du paiement programmé.' 
                : 'Remplissez les informations pour programmer un nouveau paiement.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="project_id" className="text-sm font-medium">Projet</label>
                  <select
                    id="project_id"
                    className="w-full p-2 border rounded"
                    {...form.register('project_id', { required: 'Le projet est requis' })}
                    disabled={!!editingPayment}
                  >
                    <option value="">Sélectionner un projet</option>
                    {availableProjects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.company_name})
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.project_id && (
                    <p className="text-sm text-red-500">{form.formState.errors.project_id.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="payment_date" className="text-sm font-medium">Date de paiement</label>
                  <input
                    id="payment_date"
                    type="date"
                    className="w-full p-2 border rounded"
                    {...form.register('payment_date', { required: 'La date est requise' })}
                  />
                  {form.formState.errors.payment_date && (
                    <p className="text-sm text-red-500">{form.formState.errors.payment_date.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="percentage" className="text-sm font-medium">Pourcentage (%)</label>
                  <input
                    id="percentage"
                    type="number"
                    step="0.01"
                    className="w-full p-2 border rounded"
                    {...form.register('percentage', { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Le pourcentage doit être positif' }
                    })}
                  />
                  {form.formState.errors.percentage && (
                    <p className="text-sm text-red-500">{form.formState.errors.percentage.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="total_scheduled_amount" className="text-sm font-medium">Montant total (€)</label>
                  <input
                    id="total_scheduled_amount"
                    type="number"
                    step="0.01"
                    className="w-full p-2 border rounded"
                    {...form.register('total_scheduled_amount', { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Le montant doit être positif' }
                    })}
                  />
                  {form.formState.errors.total_scheduled_amount && (
                    <p className="text-sm text-red-500">{form.formState.errors.total_scheduled_amount.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">Statut</label>
                  <select
                    id="status"
                    className="w-full p-2 border rounded"
                    {...form.register('status', { required: 'Le statut est requis' })}
                  >
                    <option value="scheduled">Programmé</option>
                    <option value="pending">En attente</option>
                    <option value="paid">Payé</option>
                  </select>
                  {form.formState.errors.status && (
                    <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Annuler</Button>
              </DialogClose>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingPayment ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduledPaymentsPage;
