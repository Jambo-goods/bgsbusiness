
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsList from "@/components/projects/ProjectsList";
import { projects as localProjects } from "@/data/projects";
import { ArrowUpIcon } from "lucide-react";
import { Project } from "@/types/project";
import { fetchProjectsFromDatabase } from "@/utils/projectUtils";
import { useToast } from "@/hooks/use-toast";

export default function Opportunite() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [projects, setProjects] = useState<Project[]>(localProjects);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        const databaseProjects = await fetchProjectsFromDatabase();
        
        if (databaseProjects && databaseProjects.length > 0) {
          setProjects(databaseProjects);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des projets:", error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les projets depuis la base de données. Affichage des projets locaux.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, [toast]);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="min-h-screen page-transition bg-bgs-gray-light">
      <Navbar />
      
      <main className="pt-28 lg:pt-32 pb-20">
        {/* Hero section */}
        <ProjectsHero />
        
        {/* Filter and sort section */}
        <section className="container px-4 md:px-6 mx-auto mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-bgs-blue">
                  Découvrez nos opportunités d'investissement
                </h2>
                <p className="text-bgs-gray-medium mt-1">
                  {projects.length} projets disponibles pour diversifier votre portefeuille
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 text-sm bg-bgs-orange text-white rounded-lg hover:bg-bgs-orange-light transition-colors">
                  Tous les projets
                </button>
                <button className="px-4 py-2 text-sm bg-white border border-gray-200 text-bgs-blue rounded-lg hover:bg-bgs-gray-light transition-colors">
                  Actifs
                </button>
                <button className="px-4 py-2 text-sm bg-white border border-gray-200 text-bgs-blue rounded-lg hover:bg-bgs-gray-light transition-colors">
                  Nouveautés
                </button>
                <button className="px-4 py-2 text-sm bg-white border border-gray-200 text-bgs-blue rounded-lg hover:bg-bgs-gray-light transition-colors">
                  Rendements élevés
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Projects list */}
        <section className="container px-4 md:px-6 mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bgs-blue"></div>
            </div>
          ) : (
            <ProjectsList projects={projects} />
          )}
        </section>
      </main>
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-bgs-blue p-3 rounded-full shadow-lg hover:bg-bgs-blue-light transition-colors z-50 animate-fade-in"
          aria-label="Retour en haut"
        >
          <ArrowUpIcon className="h-5 w-5 text-white" />
        </button>
      )}
      
      <Footer />
    </div>
  );
}
