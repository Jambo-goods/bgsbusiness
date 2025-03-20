
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Project } from "@/types/project";
import { fetchProjectsFromDatabase } from "@/utils/projectUtils";
import { toast } from "sonner";
import ProjectNotFound from "@/components/project-detail/ProjectNotFound";
import ProjectLoading from "@/components/project-detail/ProjectLoading";

// Import refactored components
import ProjectHeader from "@/components/project-detail/ProjectHeader";
import ProjectTabs from "@/components/project-detail/ProjectTabs";
import ProjectOverviewTab from "@/components/project-detail/ProjectOverviewTab";
import ProjectDocumentsTab from "@/components/project-detail/ProjectDocumentsTab";
import ProjectUpdatesTab from "@/components/project-detail/ProjectUpdatesTab";
import ProjectSidebar from "@/components/project-detail/ProjectSidebar";
import ProjectInvestmentSimulator from "@/components/project-detail/ProjectInvestmentSimulator";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'updates'>('overview');
  const [remainingDays] = useState(Math.floor(Math.random() * 30) + 10); // Simulate remaining days
  const [investorCount] = useState(Math.floor(Math.random() * 20) + 5); // Simulate investor count

  useEffect(() => {
    // Redirect if the user came from the old path "/projects/:id"
    const path = window.location.pathname;
    if (path.startsWith('/projects/') && id) {
      navigate(`/project/${id}`, { replace: true });
      return;
    }

    window.scrollTo(0, 0);
    
    // Function to load project from database
    const loadProject = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Chargement du projet avec ID:", id);
        
        if (!id) {
          console.error("ID de projet manquant");
          setError("ID de projet manquant");
          toast.error("Erreur", { description: "ID de projet manquant" });
          setLoading(false);
          return;
        }
        
        // Get projects from database
        const databaseProjects = await fetchProjectsFromDatabase();
        console.log("Projets récupérés:", databaseProjects);
        
        // Check if project exists in database
        const databaseProject = databaseProjects.find(p => p.id === id);
        
        if (databaseProject) {
          console.log("Projet trouvé dans la base de données:", databaseProject);
          setProject(databaseProject);
        } else {
          console.log("Projet non trouvé avec l'ID:", id);
          setError(`Aucun projet trouvé avec l'identifiant: ${id}`);
          toast.error("Projet non trouvé", { 
            description: `Aucun projet avec l'identifiant ${id} n'a été trouvé.` 
          });
          setProject(null);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du projet:", error);
        setError("Impossible de charger les détails du projet");
        toast.error("Erreur", {
          description: "Impossible de charger les détails du projet"
        });
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, [id, navigate]);

  if (loading) {
    return <ProjectLoading />;
  }

  if (error || !project) {
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
