
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import ProjectCard, { Project } from "@/components/ui/ProjectCard";

// Sample project data (expanded from Index page)
const projects: Project[] = [
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
  {
    id: "agro-tech",
    name: "BGS AgroTech",
    companyName: "BGS AgroTech",
    description: "Achat de machines agricoles pour améliorer la production et réduire les pertes post-récolte.",
    profitability: 14,
    duration: "24 mois",
    location: "Afrique de l'Est",
    status: "upcoming",
    minInvestment: 2500,
    image: "https://images.unsplash.com/photo-1589923188651-268a9765e432?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "logistics",
    name: "BGS Logistics",
    companyName: "BGS Logistics",
    description: "Acquisition de véhicules de transport pour faciliter la distribution des produits sur les marchés locaux.",
    profitability: 13,
    duration: "18 mois",
    location: "Afrique de l'Ouest",
    status: "active",
    minInvestment: 3000,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
];

export default function Projects() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <section className="container px-4 md:px-6 mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="mb-4 animate-fade-up">
              <span className="text-bgs-blue">Projets</span>{" "}
              <span className="text-gradient">d'investissement</span>
            </h1>
            <p className="text-xl text-bgs-blue/80 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Découvrez nos opportunités d'investissement dans des actifs physiques en Afrique
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </section>
      </main>
      
      {/* Footer section from Index page would go here - consider making a Footer component */}
      <footer className="bg-bgs-blue text-white py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <img
                src="lovable-uploads/d9a3204a-06aa-470d-8255-7f3bd0852557.png"
                alt="BGS Business Club"
                className="h-12 mb-4"
              />
              <p className="text-white/70 mb-4">
                BGS Business Club vous permet d'investir dans des actifs physiques en Afrique et de générer des rendements attractifs.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2">
                {["Accueil", "Projets", "Comment ça marche", "À propos"].map((link, i) => (
                  <li key={i}>
                    <a href={i === 0 ? "/" : `/${link.toLowerCase().replace(/ /g, "-")}`} className="text-white/70 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2">
                {["FAQ", "Conditions d'utilisation", "Politique de confidentialité"].map((resource, i) => (
                  <li key={i}>
                    <a href={`/${resource.toLowerCase().replace(/ /g, "-").replace(/'/g, "")}`} className="text-white/70 hover:text-white transition-colors">
                      {resource}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-white/70">
                  Email: contact@bgsbusiness.club
                </li>
                <li className="text-white/70">
                  Téléphone: +33 1 23 45 67 89
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-white/10 text-center text-white/50 text-sm">
            &copy; {new Date().getFullYear()} BGS Business Club. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
