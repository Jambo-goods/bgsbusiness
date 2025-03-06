
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { projects as localProjects } from "@/data/projects";
import { Project } from "@/types/project";
import { fetchProjectsFromDatabase } from "@/utils/projectUtils";
import { useToast } from "@/hooks/use-toast";

// Import refactored components
import ProjectHeader from "@/components/project-detail/ProjectHeader";
import ProjectTabs from "@/components/project-detail/ProjectTabs";
import ProjectOverviewTab from "@/components/project-detail/ProjectOverviewTab";
import ProjectDocumentsTab from "@/components/project-detail/ProjectDocumentsTab";
import ProjectUpdatesTab from "@/components/project-detail/ProjectUpdatesTab";
import ProjectSidebar from "@/components/project-detail/ProjectSidebar";
import ProjectLoading from "@/components/project-detail/ProjectLoading";
import ProjectNotFound from "@/components/project-detail/ProjectNotFound";
import ProjectInvestmentSimulator from "@/components/project-detail/ProjectInvestmentSimulator";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'updates'>('overview');
  const [remainingDays] = useState(Math.floor(Math.random() * 30) + 10); // Simulate remaining days
  const [investorCount] = useState(Math.floor(Math.random() * 20) + 5); // Simulate investor count
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Fonction pour charger le projet depuis la base de données et les données locales
    const loadProject = async () => {
      setLoading(true);
      try {
        // Essayer de récupérer les projets depuis la base de données d'abord
        const databaseProjects = await fetchProjectsFromDatabase();
        
        // Combiner les projets de la base de données avec les projets locaux
        const allProjects = [...databaseProjects];
        
        // Vérifier si le projet existe déjà dans les projets de la base de données
        const databaseProject = allProjects.find(p => p.id === id);
        
        if (databaseProject) {
          console.log("Projet trouvé dans la base de données:", databaseProject);
          setProject(databaseProject);
        } else {
          // Si le projet n'est pas trouvé dans la base de données, chercher dans les projets locaux
          console.log("Projet non trouvé dans la base de données, recherche dans les projets locaux");
          const localProject = localProjects.find(p => p.id === id);
          
          if (localProject) {
            console.log("Projet trouvé dans les données locales:", localProject);
            setProject(localProject);
          } else {
            console.log("Projet non trouvé:", id);
            setProject(null);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du projet:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails du projet",
          variant: "destructive"
        });
        
        // En cas d'erreur, essayer de charger depuis les données locales
        const localProject = localProjects.find(p => p.id === id);
        if (localProject) {
          setProject(localProject);
        } else {
          setProject(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, [id, toast]);

  if (loading) {
    return <ProjectLoading />;
  }

  if (!project) {
    return <ProjectNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="w-full mx-auto">
          <div className="px-4 md:px-6 lg:px-8 xl:px-12 max-w-[1600px] mx-auto">
            <ProjectHeader project={project} />
          </div>
            
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 xl:px-12">
            <ProjectTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
              {/* Main Content */}
              <div className="lg:col-span-2 xl:col-span-3 space-y-6">
                {activeTab === 'overview' && <ProjectOverviewTab project={project} />}
                {activeTab === 'documents' && <ProjectDocumentsTab />}
                {activeTab === 'updates' && <ProjectUpdatesTab />}
                
                {/* Investment simulator - only show on overview tab */}
                {activeTab === 'overview' && <ProjectInvestmentSimulator project={project} />}
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <ProjectSidebar 
                  project={project} 
                  remainingDays={remainingDays} 
                  investorCount={investorCount} 
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
