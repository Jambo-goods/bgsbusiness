import React, { useState } from 'react';
import { 
  Building, MapPin, Image, Calendar, TrendingUp, 
  Clock, CreditCard, CheckCircle, XCircle,
  File, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import DocumentUploadTab from './DocumentUploadTab';

interface FormDataType {
  name: string;
  company_name: string;
  description: string;
  location: string;
  image: string;
  price: string;
  yield: string;
  min_investment: string;
  duration: string;
  category: string;
  status: string;
  funding_progress: string;
  possible_durations: string;
  profitability: string;
  // Nouveaux champs pour le partenaire local
  partner_description?: string;
  partner_experience?: string;
  partner_employees?: string;
  partner_projects?: string;
  partner_satisfaction?: string;
}

interface ProjectFormProps {
  formData: FormDataType;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmitProject: (e: React.FormEvent) => void;
  formErrors: Record<string, string>;
  editingProject: any;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  formData,
  handleFormChange,
  handleSubmitProject,
  formErrors,
  editingProject,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState('details');
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 my-8 max-h-[90vh]">
        <h2 className="text-xl font-semibold text-bgs-blue mb-4">
          {editingProject ? `Modifier le projet: ${editingProject.name}` : 'Ajouter un nouveau projet'}
        </h2>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4 sticky top-0 z-10 bg-white">
            <TabsTrigger value="details" className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>Détails du projet</span>
            </TabsTrigger>
            <TabsTrigger value="partner" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Partenaire local</span>
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="flex items-center gap-1"
              disabled={!editingProject}
            >
              <File className="h-4 w-4" />
              <span>Documents</span>
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[calc(90vh-150px)]">
            <TabsContent value="details">
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
                    onClick={onCancel}
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
            </TabsContent>
            
            <TabsContent value="partner">
              <form onSubmit={handleSubmitProject} className="space-y-4">
                <div>
                  <Label htmlFor="partner_description" className="text-sm font-medium text-gray-700">
                    Description du partenaire local
                  </Label>
                  <textarea
                    id="partner_description"
                    name="partner_description"
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Description du partenaire local"
                    value={formData.partner_description || ''}
                    onChange={handleFormChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cette description apparaîtra dans la section partenaire local du projet
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partner_experience" className="text-sm font-medium text-gray-700">
                      Années d'expérience
                    </Label>
                    <div className="relative mt-1">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="partner_experience"
                        name="partner_experience"
                        type="text"
                        className="pl-10"
                        placeholder="ex: 5+"
                        value={formData.partner_experience || ''}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="partner_employees" className="text-sm font-medium text-gray-700">
                      Nombre d'employés
                    </Label>
                    <div className="relative mt-1">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="partner_employees"
                        name="partner_employees"
                        type="number"
                        className="pl-10"
                        placeholder="ex: 12"
                        value={formData.partner_employees || ''}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partner_projects" className="text-sm font-medium text-gray-700">
                      Projets réalisés
                    </Label>
                    <div className="relative mt-1">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="partner_projects"
                        name="partner_projects"
                        type="number"
                        className="pl-10"
                        placeholder="ex: 8"
                        value={formData.partner_projects || ''}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="partner_satisfaction" className="text-sm font-medium text-gray-700">
                      Taux de satisfaction (%)
                    </Label>
                    <div className="relative mt-1">
                      <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="partner_satisfaction"
                        name="partner_satisfaction"
                        type="number"
                        min="0"
                        max="100"
                        className="pl-10"
                        placeholder="ex: 98"
                        value={formData.partner_satisfaction || ''}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
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
            </TabsContent>
            
            <TabsContent value="documents">
              {editingProject ? (
                <DocumentUploadTab projectId={editingProject.id} />
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Veuillez d'abord créer le projet</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('details')}
                >
                  Retour aux détails
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Fermer
                </Button>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectForm;
