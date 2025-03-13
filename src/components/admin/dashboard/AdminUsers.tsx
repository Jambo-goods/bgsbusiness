
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Pagination, PaginationContent, PaginationItem, 
  PaginationLink, PaginationNext, PaginationPrevious 
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { RefreshCw, UserPlus } from 'lucide-react';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';

const AdminUsers = () => {
  const { adminUsers, isLoading, fetchAdminUsers, addAdmin } = useAdminUsers();
  const [page, setPage] = useState(1);
  const [emailInput, setEmailInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  const handleAddAdmin = async () => {
    if (!emailInput.trim()) {
      toast.error('Veuillez entrer un email');
      return;
    }
    
    setIsAdding(true);
    try {
      await addAdmin(emailInput);
      setEmailInput('');
    } finally {
      setIsAdding(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(adminUsers.length / itemsPerPage);
  const paginatedUsers = adminUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => setPage(i)}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} />
            </PaginationItem>
          )}
          
          {pages}
          
          {page < totalPages && (
            <PaginationItem>
              <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Administrateurs
          <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
            {adminUsers.length}
          </span>
        </h2>
        <Button 
          onClick={fetchAdminUsers} 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualiser</span>
        </Button>
      </div>
      
      {/* Admin Add Form */}
      <div className="flex gap-2 mb-4">
        <input
          type="email"
          placeholder="Email de l'administrateur"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          disabled={isAdding}
        />
        <Button 
          onClick={handleAddAdmin} 
          size="sm" 
          disabled={isAdding || !emailInput.trim()}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Ajouter</span>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement des administrateurs...</p>
        </div>
      ) : adminUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun administrateur trouvé</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.role}</TableCell>
                    <TableCell>
                      {admin.created_at ? new Date(admin.created_at).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell>
                      {/* No delete button for the current admin user */}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => window.confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?') && fetchAdminUsers()}
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default AdminUsers;
