
import { Link } from "react-router-dom";
import ProjectCard, { Project } from "@/components/ui/ProjectCard";

// Sample project data
const featuredProjects: Project[] = [
  {
    id: "wood-africa",
    name: "BGS Wood Africa",
    companyName: "BGS Wood Africa",
    description: "Achat de tronçonneuses pour découper du bois et produire des matériaux de construction.",
    profitability: 15,
    duration: "Flexible",
    location: "Afrique de l'Ouest",
    status: "active",
    minInvestment: 1500,
    image: "https://images.unsplash.com/photo-1614254136161-0314a45127a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "energy",
    name: "BGS Energy",
    companyName: "BGS Energy",
    description: "Achat d'équipements pour collecter et transformer les déchets en carburant, gaz et charbon.",
    profitability: 12,
    duration: "12 mois",
    location: "Afrique centrale",
    status: "upcoming",
    minInvestment: 2000,
    image: "https://images.unsplash.com/photo-1540324603583-fa99c8235661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
];

export default function FeaturedProjects() {
  return (
    <section className="py-20 bg-bgs-gray-light relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-bgs-blue animate-fade-up">
              Projets d'investissement
            </h2>
            <p className="text-bgs-blue/80 mt-2 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Découvrez les opportunités d'investissement disponibles
            </p>
          </div>
          <Link 
            to="/projects" 
            className="text-bgs-orange font-medium hover:text-bgs-orange-light transition-colors animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Voir tous les projets
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {featuredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
