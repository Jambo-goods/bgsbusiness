
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, Plus, ArrowUp, ArrowDown, Image,
  Loader2, Pencil, Trash2, Building, MapPin, 
  Calendar, TrendingUp, Clock, CreditCard, ChevronDown, Filter, ArrowUpDown
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
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

export default function ProjectsManagement() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    funding_progress: '0',
    possible_durations: '',
    profitability: ''
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
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const requiredFields = [
      'name', 'company_name', 'description', 'location', 'image', 
      'price', 'yield', 'min_investment', 'duration', 'category', 'profitability'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData] || formData[field as keyof typeof formData].trim() === '') {
        errors[field] = 'Ce champ est obligatoire';
      }
    });
    
    // Validate numeric fields
    if (formData.price && isNaN(Number(formData.price))) {
      errors.price = 'Doit être un nombre';
    }
    
    if (formData.yield && isNaN(Number(formData.yield))) {
      errors.yield = 'Doit être un nombre';
    }
    
    if (formData.min_investment && isNaN(Number(formData.min_investment))) {
      errors.min_investment = 'Doit être un nombre';
    }
    
    if (formData.profitability && isNaN(Number(formData.profitability))) {
      errors.profitability = 'Doit être un nombre';
    }
    
    // Validate possible_durations format if provided
    if (formData.possible_durations) {
      const durationItems = formData.possible_durations.split(',').map(item => item.trim());
      for (const item of durationItems) {
        if (isNaN(Number(item))) {
          errors.possible_durations = 'Doit être une liste de nombres séparés par des virgules';
          break;
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }
    
    try {
      // Parse numeric values
      const projectData = {
        ...formData,
        price: parseInt(formData.price),
        yield: parseFloat(formData.yield),
        profitability: parseFloat(formData.profitability),
        min_investment: parseInt(formData.min_investment),
        funding_progress: parseInt(formData.funding_progress) || 0,
        possible_durations: formData.possible_durations ? 
          formData.possible_durations.split(',').map(d => parseInt(d.trim())) : 
          [] // Ensure it's always an array, empty if no values
      };
      
      console.log("Submitting project data:", projectData);
      
      let result;
      
      if (editingProject) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id)
          .select();
          
        if (error) {
          console.error("Error updating project:", error);
          throw error;
        }
        result = data?.[0];
        
        toast.success(`Le projet ${formData.name} a été mis à jour`);
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('projects')
          .insert(projectData)
          .select();
          
        if (error) {
          console.error("Error details:", error);
          throw error;
        }
        result = data?.[0];
        
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
        funding_progress: '0',
        possible_durations: '',
        profitability: ''
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
      funding_progress: project.funding_progress?.toString() || '0',
      possible_durations: project.possible_durations ? project.possible_durations.join(', ') : '',
      profitability: project.profitability?.toString() || ''
    });
    setIsAddProjectModalOpen(true);
  };

  const handleDeleteProject = async (project: any) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);
        
      if (error) throw error;
      
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
    <div className="min-h-screen bg-gray-50">
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
                      <Link to="/scheduled-payments" className="flex items-center space-x-2 hover:bg-gray-100 rounded p-2">
                        <span>Paiements Programmés</span>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/projects-management" className="flex items-center space-x-2 bg-gray-100 rounded p-2 font-medium">
                        <span>Gestion des Projets</span>
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
          <h1 className="text-2xl font-bold">Gestion des Projets</h1>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <DropdownMenuLabel>Statut</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Tous</DropdownMenuItem>
                <DropdownMenuItem>Actif</DropdownMenuItem>
                <DropdownMenuItem>Terminé</DropdownMenuItem>
                <DropdownMenuItem>À venir</DropdownMenuItem>
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
                <DropdownMenuItem onClick={() => handleSort('name')}>
                  Nom {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('price')}>
                  Prix {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('yield')}>
                  Rendement {sortField === 'yield' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('created_at')}>
                  Date {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
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
                  funding_progress: '0',
                  possible_durations: '',
                  profitability: ''
                });
                setFormErrors({});
                setIsAddProjectModalOpen(true);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un projet
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
                        className="flex items-center space-x-1 hover:text-blue-500"
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
                        className="flex items-center space-x-1 hover:text-blue-500"
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
                        className="flex items-center space-x-1 hover:text-blue-500"
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
      </div>
      
      {/* Add/Edit Project Modal */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 my-8">
            <h2 className="text-xl font-semibold text-blue-500 mb-4">
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
                      className={`pl-10 ${formErrors.name ? 'border-red-500' : ''}`}
                      placeholder="Nom du projet"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
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
                      className={`pl-10 ${formErrors.company_name ? 'border-red-500' : ''}`}
                      placeholder="Nom de la société"
                      value={formData.company_name}
                      onChange={handleFormChange}
                      required
                    />
                    {formErrors.company_name && <p className="text-red-500 text-xs mt-1">{formErrors.company_name}</p>}
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
                  className={`mt-1 block w-full rounded-md border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                  placeholder="Description du projet"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                />
                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
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
                      className={`pl-10 ${formErrors.location ? 'border-red-500' : ''}`}
                      placeholder="Localisation"
                      value={formData.location}
                      onChange={handleFormChange}
                      required
                    />
                    {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Catégorie *
                  </Label>
                  <select
                    id="category"
                    name="category"
                    className={`mt-1 block w-full rounded-md border ${formErrors.category ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
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
                  {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
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
                    className={`pl-10 ${formErrors.image ? 'border-red-500' : ''}`}
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={handleFormChange}
                    required
                  />
                  {formErrors.image && <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>}
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
                      className={`pl-10 ${formErrors.price ? 'border-red-500' : ''}`}
                      placeholder="Prix"
                      value={formData.price}
                      onChange={handleFormChange}
                      required
                    />
                    {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
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
                      className={`pl-10 ${formErrors.yield ? 'border-red-500' : ''}`}
                      placeholder="Rendement"
                      value={formData.yield}
                      onChange={handleFormChange}
                      required
                    />
                    {formErrors.yield && <p className="text-red-500 text-xs mt-1">{formErrors.yield}</p>}
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
                      className={`pl-10 ${formErrors.min_investment ? 'border-red-500' : ''}`}
                      placeholder="Investissement minimum"
                      value={formData.min_investment}
                      onChange={handleFormChange}
                      required
                    />
                    {formErrors.min_investment && <p className="text-red-500 text-xs mt-1">{formErrors.min_investment}</p>}
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
                      className={`pl-10 ${formErrors.duration ? 'border-red-500' : ''}`}
                      placeholder="ex: 12-24 mois"
                      value={formData.duration}
                      onChange={handleFormChange}
                      required
                    />
                    {formErrors.duration && <p className="text-red-500 text-xs mt-1">{formErrors.duration}</p>}
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
                      className={`pl-10 ${formErrors.possible_durations ? 'border-red-500' : ''}`}
                      placeholder="ex: 12, 18, 24"
                      value={formData.possible_durations}
                      onChange={handleFormChange}
                    />
                    {formErrors.possible_durations && <p className="text-red-500 text-xs mt-1">{formErrors.possible_durations}</p>}
                    <p className="text-xs text-gray-500 mt-1">Entrez des nombres séparés par des virgules</p>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profitability" className="text-sm font-medium text-gray-700">
                    Rentabilité (%) *
                  </Label>
                  <div className="relative mt-1">
                    <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="profitability"
                      name="profitability"
                      type="number"
                      min="0.1"
                      step="0.1"
                      className={`pl-10 ${formErrors.profitability ? 'border-red-500' : ''}`}
                      placeholder="Rentabilité"
                      value={formData.profitability}
                      onChange={handleFormChange}
                      required
                    />
                    {formErrors.profitability && <p className="text-red-500 text-xs mt-1">{formErrors.profitability}</p>}
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
                    <option value="upcoming">À venir</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddProjectModalOpen(false);
                    setEditingProject(null);
                    setFormErrors({});
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
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
