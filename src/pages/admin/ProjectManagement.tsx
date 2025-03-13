
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  PlusCircle, 
  RefreshCw, 
  Edit, 
  Trash2, 
  Search, 
  AlertTriangle
} from 'lucide-react';

export default function ProjectManagement() {
  const { adminUser } = useAdmin();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    description: '',
    location: '',
    price: 0,
    min_investment: 0,
    yield: 0,
    profitability: 0,
    funding_progress: 0,
    category: '',
    status: 'upcoming',
    duration: '12 mois',
    image: '/placeholder.svg'
  });

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRefresh = async () => {
    await fetchProjects();
    toast.success('Liste des projets actualisée');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields
    if (['price', 'min_investment', 'yield', 'profitability', 'funding_progress'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProject) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(formData)
          .eq('id', editingProject.id);

        if (error) throw error;
        toast.success('Projet mis à jour avec succès');
      } else {
        // Add new project
        const { error } = await supabase
          .from('projects')
          .insert([formData]);

        if (error) throw error;
        toast.success('Projet ajouté avec succès');
      }
      
      setIsDialogOpen(false);
      fetchProjects();
      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error("Erreur lors de l'enregistrement du projet");
    }
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      company_name: project.company_name,
      description: project.description,
      location: project.location,
      price: project.price,
      min_investment: project.min_investment,
      yield: project.yield,
      profitability: project.profitability,
      funding_progress: project.funding_progress,
      category: project.category,
      status: project.status,
      duration: project.duration,
      image: project.image
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Projet supprimé avec succès');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erreur lors de la suppression du projet');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company_name: '',
      description: '',
      location: '',
      price: 0,
      min_investment: 0,
      yield: 0,
      profitability: 0,
      funding_progress: 0,
      category: '',
      status: 'upcoming',
      duration: '12 mois',
      image: '/placeholder.svg'
    });
    setEditingProject(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Gestion des Projets | BGS Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Projets</h1>
          <div className="flex space-x-2">
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualiser</span>
            </button>
            
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="bg-bgs-blue hover:bg-bgs-blue-dark flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Ajouter un projet</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProject ? 'Modifier le projet' : 'Ajouter un nouveau projet'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleAddEdit} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom du projet</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Nom de l'entreprise</Label>
                      <Input 
                        id="company_name" 
                        name="company_name" 
                        value={formData.company_name} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea 
                      id="description" 
                      name="description" 
                      className="w-full min-h-[100px] border rounded-md p-2" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation</Label>
                      <Input 
                        id="location" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Catégorie</Label>
                      <select 
                        id="category" 
                        name="category" 
                        className="w-full border rounded-md p-2" 
                        value={formData.category} 
                        onChange={handleInputChange} 
                        required
                      >
                        <option value="">Sélectionner une catégorie</option>
                        <option value="energy">Énergie</option>
                        <option value="real_estate">Immobilier</option>
                        <option value="agriculture">Agriculture</option>
                        <option value="technology">Technologie</option>
                        <option value="green">Écologie</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Prix du projet (€)</Label>
                      <Input 
                        id="price" 
                        name="price" 
                        type="number" 
                        value={formData.price} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="min_investment">Investissement min. (€)</Label>
                      <Input 
                        id="min_investment" 
                        name="min_investment" 
                        type="number" 
                        value={formData.min_investment} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="funding_progress">Progression financement (%)</Label>
                      <Input 
                        id="funding_progress" 
                        name="funding_progress" 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={formData.funding_progress} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yield">Rendement mensuel (%)</Label>
                      <Input 
                        id="yield" 
                        name="yield" 
                        type="number" 
                        step="0.1" 
                        value={formData.yield} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="profitability">Rentabilité (%)</Label>
                      <Input 
                        id="profitability" 
                        name="profitability" 
                        type="number" 
                        step="0.1" 
                        value={formData.profitability} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration">Durée</Label>
                      <Input 
                        id="duration" 
                        name="duration" 
                        value={formData.duration} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Statut</Label>
                      <select 
                        id="status" 
                        name="status" 
                        className="w-full border rounded-md p-2" 
                        value={formData.status} 
                        onChange={handleInputChange} 
                        required
                      >
                        <option value="upcoming">À venir</option>
                        <option value="active">Actif</option>
                        <option value="completed">Complété</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="image">URL de l'image</Label>
                      <Input 
                        id="image" 
                        name="image" 
                        value={formData.image} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" className="bg-bgs-blue hover:bg-bgs-blue-dark">
                      {editingProject ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
          <div className="flex mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un projet..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgs-blue"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">Aucun projet trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Rendement</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.company_name}</TableCell>
                      <TableCell>{project.category}</TableCell>
                      <TableCell>{project.price.toLocaleString()} €</TableCell>
                      <TableCell>{project.yield}%</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : project.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status === 'active' 
                            ? 'Actif' 
                            : project.status === 'upcoming'
                            ? 'À venir'
                            : 'Complété'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(project)}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDelete(project.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
