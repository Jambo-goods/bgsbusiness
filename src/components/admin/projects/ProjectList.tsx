
import React from 'react';
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

interface ProjectListProps {
  projects: any[];
  isLoading: boolean;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
  handleEditProject: (project: any) => void;
  handleDeleteProject: (project: any) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  isLoading,
  sortField,
  sortDirection,
  handleSort,
  handleEditProject,
  handleDeleteProject
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-bgs-blue" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Aucun projet trouvé
      </div>
    );
  }

  return (
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
          {projects.map((project) => (
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
  );
};

export default ProjectList;
