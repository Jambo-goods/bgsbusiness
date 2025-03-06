
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { logAdminAction } from '@/services/adminAuthService';
import { 
  Search, Plus, ArrowUp, ArrowDown, Image,
  Loader2, Pencil, Trash2, Building, MapPin, 
  Calendar, TrendingUp, Clock, CreditCard, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function ProjectManagement() {
  const { adminUser } = useAdmin();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingProject, setEditingProject] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    description: '',
    location: '',
    image: '',
    price: '',
    yield: '',
    min_investment: '',
    duration: '',
    category: '',
    status: 'active',
    funding_progress: '',
    possible_durations: ''
  });

  useEffect(() => {
    fetchProjects();
  }, [sortField, sortDirection]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
        
      if (error) throw error;
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error("Erreur lors du chargement des projets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to desc
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminUser) return;
    
    try {
      // Parse numeric values
      const projectData = {
        ...formData,
        price: parseInt(formData.price),
        yield: parseFloat(formData.yield),
        min_investment: parseInt(formData.min_investment),
        funding_progress: parseInt(formData.funding_progress) || 0,
        possible_durations: formData.possible_durations ? 
          formData.possible_durations.split(',').map(d => parseInt(d.trim())) : 
          null
      };
      
      let result;
      
      if (editingProject) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id)
          .select();
          
        if (error) throw error;
        result = data?.[0];
        
        // Log admin action
        await logAdminAction(
          adminUser.id,
          'project_management',
          `Modification du projet "${formData.name}"`,
          undefined,
          editingProject.id
        );
        
        toast.success(`Le projet ${formData.name} a été mis à jour`);
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('projects')
          .insert(projectData)
          .select();
          
        if (error) throw error;
        result = data?.[0];
        
        // Log admin action
        await logAdminAction(
          adminUser.id,
          'project_management',
          `Création du projet "${formData.name}"`,
          undefined,
          result?.id
        );
        
        toast.success(`Le projet ${formData.name} a été créé`);
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        company_name: '',
        description: '',
        location: '',
        image: '',
        price: '',
        yield: '',
        min_investment: '',
        duration: '',
        category: '',
        status: 'active',
        funding_progress: '',
        possible_durations: ''
      });
      setIsAddProjectModalOpen(false);
      setEditingProject(null);
      
      // Refresh project list
      fetchProjects();
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du projet:", error);
      toast.error("Une erreur s'est produite lors de la sauvegarde du projet");
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      company_name: project.company_name || '',
      description: project.description || '',
      location: project.location || '',
      image: project.image || '',
      price: project.price?.toString() || '',
      yield: project.yield?.toString() || '',
      min_investment: project.min_investment?.toString() || '',
      duration: project.duration || '',
      category: project.category || '',
      status: project.status || 'active',
      funding_progress: project.funding_progress?.toString() || '',
      possible_durations: project.possible_durations ? project.possible_durations.join(', ') : ''
    });
    setIsAddProjectModalOpen(true);
  };

  const handleDeleteProject = async (project: any) => {
    if (!adminUser || !window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);
        
      if (error) throw error;
      
      // Log admin action
      await logAdminAction(
        adminUser.id,
        'project_management',
        `Suppression du projet "${project.name}"`,
        undefined,
        project.id
      );
      
      toast.success(`Le projet ${project.name} a été supprimé`);
      
      // Refresh project list
      fetchProjects();
      
    } catch (error) {
      console.error("Erreur lors de la suppression du projet:", error);
      toast.error("Une erreur s'est produite lors de la suppression du projet");
    }
  };

  const filteredProjects = projects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (project.name || '').toLowerCase().includes(searchLower) ||
      (project.company_name || '').toLowerCase().includes(searchLower) ||
      (project.location || '').toLowerCase().includes(searchLower) ||
      (project.category || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-bgs-blue mb-6">Gestion des Projets</h1>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un projet..."
            className="pl-10 w-full md:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => fetchProjects()}
            variant="outline"
          >
            Actualiser
          </Button>
          
          <Button
            onClick={() => {
              setEditingProject(null);
              setFormData({
                name: '',
                company_name: '',
                description: '',
                location: '',
                image: '',
                price: '',
                yield: '',
                min_investment: '',
                duration: '',
                category: '',
                status: 'active',
                funding_progress: '',
                possible_durations: ''
              });
              setIsAddProjectModalOpen(true);
            }}
            className="bg-bgs-blue hover:bg-bgs-blue-light text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un projet
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-bgs-blue" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            Aucun projet trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <button 
                      className="flex items-center space-x-1 hover:text-bgs-blue"
                      onClick={() => handleSort('name')}
                    >
                      <span>Nom du projet</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Société</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center space-x-1 hover:text-bgs-blue"
                      onClick={() => handleSort('price')}
                    >
                      <span>Prix</span>
                      {sortField === 'price' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center space-x-1 hover:text-bgs-blue"
                      onClick={() => handleSort('yield')}
                    >
                      <span>Rendement</span>
                      {sortField === 'yield' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.company_name}</TableCell>
                    <TableCell>{project.location}</TableCell>
                    <TableCell>{project.price?.toLocaleString() || 0} €</TableCell>
                    <TableCell>{project.yield}% par mois</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'active' ? 'Actif' : project.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProject(project)}
                          title="Supprimer"
                          className="text-red-500 hover:text-red-700"
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
      
      {/* Add/Edit Project Modal */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 my-8">
            <h2 className="text-xl font-semibold text-bgs-blue mb-4">
              {editingProject ? `Modifier le projet: ${editingProject.name}` : 'Ajouter un nouveau projet'}
            </h2>
            
            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nom du projet *
                  </Label>
                  <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      className="pl-10"
                      placeholder="Nom du projet"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="company_name" className="text-sm font-medium text-gray-700">
                    Nom de la société *
                  </Label>
                  <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="company_name"
                      name="company_name"
                      className="pl-10"
                      placeholder="Nom de la société"
                      value={formData.company_name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description *
                </Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Description du projet"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Localisation *
                  </Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="location"
                      name="location"
                      className="pl-10"
                      placeholder="Localisation"
                      value={formData.location}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Catégorie *
                  </Label>
                  <select
                    id="category"
                    name="category"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    value={formData.category}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="immobilier">Immobilier</option>
                    <option value="commerce">Commerce</option>
                    <option value="technologie">Technologie</option>
                    <option value="energie">Énergie</option>
                    <option value="agriculture">Agriculture</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="image" className="text-sm font-medium text-gray-700">
                  URL de l'image *
                </Label>
                <div className="relative mt-1">
                  <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="image"
                    name="image"
                    className="pl-10"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                    Prix total (€) *
                  </Label>
                  <div className="relative mt-1">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="1"
                      step="1"
                      className="pl-10"
                      placeholder="Prix"
                      value={formData.price}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="yield" className="text-sm font-medium text-gray-700">
                    Rendement mensuel (%) *
                  </Label>
                  <div className="relative mt-1">
                    <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="yield"
                      name="yield"
                      type="number"
                      min="0.1"
                      step="0.1"
                      className="pl-10"
                      placeholder="Rendement"
                      value={formData.yield}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="min_investment" className="text-sm font-medium text-gray-700">
                    Investissement min. (€) *
                  </Label>
                  <div className="relative mt-1">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="min_investment"
                      name="min_investment"
                      type="number"
                      min="1"
                      step="1"
                      className="pl-10"
                      placeholder="Investissement minimum"
                      value={formData.min_investment}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                    Durée (texte) *
                  </Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="duration"
                      name="duration"
                      className="pl-10"
                      placeholder="ex: 12-24 mois"
                      value={formData.duration}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="possible_durations" className="text-sm font-medium text-gray-700">
                    Durées possibles (mois, séparées par virgules)
                  </Label>
                  <div className="relative mt-1">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="possible_durations"
                      name="possible_durations"
                      className="pl-10"
                      placeholder="ex: 12, 18, 24"
                      value={formData.possible_durations}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="funding_progress" className="text-sm font-medium text-gray-700">
                    Progression du financement (%)
                  </Label>
                  <div className="relative mt-1">
                    <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="funding_progress"
                      name="funding_progress"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      className="pl-10"
                      placeholder="Progression"
                      value={formData.funding_progress}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Statut *
                </Label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={formData.status}
                  onChange={handleFormChange}
                  required
                >
                  <option value="active">Actif</option>
                  <option value="completed">Terminé</option>
                  <option value="pending">En attente</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddProjectModalOpen(false);
                    setEditingProject(null);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-bgs-blue hover:bg-bgs-blue-light text-white"
                >
                  {editingProject ? 'Mettre à jour' : 'Ajouter le projet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
