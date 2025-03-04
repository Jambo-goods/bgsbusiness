
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Users, DollarSign, LineChart, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { projects } from "@/data/projects";
import { Progress } from "@/components/ui/progress";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Simuler une requête API
    setLoading(true);
    setTimeout(() => {
      const foundProject = projects.find(p => p.id === id);
      setProject(foundProject);
      setLoading(false);
    }, 300);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen page-transition">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-bgs-blue/20 border-t-bgs-blue rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-bgs-blue/70">Chargement du projet...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen page-transition">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-bgs-blue mb-4">Projet non trouvé</h1>
              <p className="text-bgs-blue/70 mb-6">
                Le projet que vous recherchez n'existe pas ou a été supprimé.
              </p>
              <Link to="/projects" className="btn-primary inline-flex items-center">
                <ArrowLeft size={18} className="mr-2" />
                Retour aux projets
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <div className="flex items-center text-sm text-bgs-blue/60 mb-6">
              <Link to="/" className="hover:text-bgs-orange transition-colors">Accueil</Link>
              <ChevronRight size={16} className="mx-1" />
              <Link to="/projects" className="hover:text-bgs-orange transition-colors">Projets</Link>
              <ChevronRight size={16} className="mx-1" />
              <span className="text-bgs-blue">{project.name}</span>
            </div>
            <Link to="/projects" className="text-bgs-orange hover:text-bgs-orange-light inline-flex items-center">
              <ArrowLeft size={18} className="mr-2" />
              Retour aux projets
            </Link>
          </div>
          
          {/* Project Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="glass-card overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-bgs-orange/10 text-bgs-orange mb-3">
                      {project.category}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-bold text-bgs-blue">{project.name}</h1>
                    <p className="text-bgs-blue/70 mt-2">{project.location}</p>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-bgs-blue mb-3">Description</h2>
                  <p className="text-bgs-blue/80 mb-6">
                    {project.description}
                  </p>
                  
                  <h2 className="text-xl font-semibold text-bgs-blue mb-3">Détails du projet</h2>
                  <p className="text-bgs-blue/80 mb-6">
                    Ce projet vise à acquérir et déployer {project.name} pour répondre aux besoins locaux croissants dans la région. Les équipements seront exploités par notre partenaire local qui possède une solide expérience dans ce secteur. L'accord de partenariat prévoit un partage des revenus qui assure un rendement attractif pour les investisseurs tout en garantissant une maintenance adéquate des équipements.
                  </p>
                  
                  <h2 className="text-xl font-semibold text-bgs-blue mb-3">Avantages</h2>
                  <ul className="list-disc pl-5 space-y-2 text-bgs-blue/80 mb-6">
                    <li>Rendement mensuel régulier</li>
                    <li>Actif physique tangible comme garantie</li>
                    <li>Impact positif sur l'économie locale</li>
                    <li>Diversification géographique de vos investissements</li>
                    <li>Suivi transparent des performances</li>
                  </ul>
                  
                  <h2 className="text-xl font-semibold text-bgs-blue mb-3">Partenaire local</h2>
                  <p className="text-bgs-blue/80 mb-6">
                    Notre partenaire local pour ce projet est une entreprise établie depuis plus de 5 ans dans la région, avec une excellente réputation et une connaissance approfondie du marché local. Un contrat solide encadre notre collaboration pour garantir la protection des intérêts des investisseurs.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-32">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">Informations d'investissement</h2>
                
                <div className="space-y-6">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-bgs-blue/70">Progression</span>
                      <span className="text-sm font-medium text-bgs-blue">
                        {project.fundingProgress}%
                      </span>
                    </div>
                    <Progress value={project.fundingProgress} className="h-2" />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-bgs-blue/60">
                        {Math.round(project.price * project.fundingProgress / 100).toLocaleString()} € récoltés
                      </span>
                      <span className="text-xs text-bgs-blue/60">
                        Objectif: {project.price.toLocaleString()} €
                      </span>
                    </div>
                  </div>
                  
                  {/* Key info */}
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-bgs-blue/5 p-2 rounded-full mr-3">
                        <Calendar size={18} className="text-bgs-blue" />
                      </div>
                      <div>
                        <p className="text-sm text-bgs-blue/70">Durée du projet</p>
                        <p className="text-bgs-blue font-medium">36 mois</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-bgs-blue/5 p-2 rounded-full mr-3">
                        <LineChart size={18} className="text-bgs-blue" />
                      </div>
                      <div>
                        <p className="text-sm text-bgs-blue/70">Rendement estimé</p>
                        <p className="text-bgs-blue font-medium">{project.yield}% annuel</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-bgs-blue/5 p-2 rounded-full mr-3">
                        <DollarSign size={18} className="text-bgs-blue" />
                      </div>
                      <div>
                        <p className="text-sm text-bgs-blue/70">Investissement minimum</p>
                        <p className="text-bgs-blue font-medium">1 500 €</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-bgs-blue/5 p-2 rounded-full mr-3">
                        <Users size={18} className="text-bgs-blue" />
                      </div>
                      <div>
                        <p className="text-sm text-bgs-blue/70">Investisseurs</p>
                        <p className="text-bgs-blue font-medium">12 investisseurs</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div>
                    <Link 
                      to="/login" 
                      className="btn-primary w-full justify-center mb-3"
                    >
                      Investir dans ce projet
                    </Link>
                    <p className="text-xs text-center text-bgs-blue/60">
                      La création d'un compte est nécessaire pour investir
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
