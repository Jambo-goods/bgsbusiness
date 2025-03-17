
import { Project } from "@/types";

export const filterProjects = (projects: Project[], searchTerm: string): Project[] => {
  const lowerSearchTerm = searchTerm.toLowerCase();

  return projects.filter(project => {
    const projectName = project.name.toLowerCase();
    const projectDescription = project.description.toLowerCase();
    const projectCategory = project.category.toLowerCase();

    return (
      projectName.includes(lowerSearchTerm) ||
      projectDescription.includes(lowerSearchTerm) ||
      projectCategory.includes(lowerSearchTerm)
    );
  });
};

export const sortProjects = (projects: Project[], sortBy: string, sortOrder: string): Project[] => {
  const sortedProjects = [...projects];

  sortedProjects.sort((a, b) => {
    let comparison = 0;

    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === "category") {
      comparison = a.category.localeCompare(b.category);
    } else if (sortBy === "endDate") {
      const dateA = new Date(a.endDate).getTime();
      const dateB = new Date(b.endDate).getTime();
      comparison = dateA - dateB;
    }

    return sortOrder === "asc" ? comparison : comparison * -1;
  });

  return sortedProjects;
};

export const paginateProjects = (projects: Project[], currentPage: number, itemsPerPage: number): Project[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return projects.slice(startIndex, endIndex);
};

export const calculateTotalPages = (totalItems: number, itemsPerPage: number): number => {
  const totalPages = typeof itemsPerPage === 'string' 
  ? Math.ceil(totalItems / parseInt(itemsPerPage, 10)) 
  : Math.ceil(totalItems / itemsPerPage);
  return totalPages;
};
