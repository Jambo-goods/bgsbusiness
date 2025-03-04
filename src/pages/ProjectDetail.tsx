
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { projects } from "@/data/projects";
import { Project } from "@/types/project";

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

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Simulate API request
    setLoading(true);
    setTimeout(() => {
      const foundProject = projects.find(p => p.id === id);
      setProject(foundProject || null);
      setLoading(false);
    }, 300);
  }, [id]);

  if (loading) {
    return <ProjectLoading />;
  }

  if (!project) {
    return <ProjectNotFound />;
  }

  return (
    <div className="min-h-screen page-transition bg-gray-50">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          <ProjectHeader project={project} />
          
          <ProjectTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'overview' && <ProjectOverviewTab project={project} />}
              {activeTab === 'documents' && <ProjectDocumentsTab />}
              {activeTab === 'updates' && <ProjectUpdatesTab />}
              
              {/* Ajout du simulateur d'investissement après l'onglet actif */}
              {activeTab === 'overview' && <div className="mt-6">
                <ProjectInvestmentSimulator project={project} />
              </div>}
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
      </main>
      
      <Footer />
    </div>
  );
}
