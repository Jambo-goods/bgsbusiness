
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  LineChart, 
  ChevronRight, 
  Shield, 
  FileText, 
  Share2, 
  Download,
  Globe,
  TrendingUp,
  Building,
  CheckCircle
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { projects } from "@/data/projects";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";

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

  // Sample project updates
  const projectUpdates = [
    {
      date: "15 Juin 2023",
      title: "Lancement du projet",
      content: "Nous avons officiellement lancé le projet et commencé à collecter des fonds."
    },
    {
      date: "22 Juillet 2023",
      title: "Première phase de financement atteinte",
      content: "Nous avons atteint notre premier objectif de financement et commencé les premières acquisitions d'équipement."
    },
    {
      date: "10 Septembre 2023",
      title: "Déploiement sur le terrain",
      content: "Les premiers équipements ont été déployés sur le terrain et sont maintenant opérationnels."
    }
  ];

  // Sample project documents
  const projectDocuments = [
    { name: "Présentation du projet", type: "PDF", size: "2.4 MB" },
    { name: "Analyse financière", type: "PDF", size: "1.8 MB" },
    { name: "Contrat d'investissement", type: "PDF", size: "0.5 MB" },
    { name: "Certification des équipements", type: "PDF", size: "3.1 MB" }
  ];

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
    <div className="min-h-screen page-transition bg-gray-50">
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
          
          {/* Project Header */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-8 animate-fade-up">
            <div className="relative h-64 md:h-96">
              <img 
                src={project.image} 
                alt={project.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-bgs-orange text-white">
                    {project.category}
                  </span>
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    project.status === 'active' 
                      ? 'bg-blue-500 text-white' 
                      : project.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : 'bg-orange-500 text-white'
                  }`}>
                    {project.status === 'active' ? 'Projet actif' : project.status === 'completed' ? 'Projet complété' : 'À venir'}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{project.name}</h1>
                <p className="text-white/80">{project.location}</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-8 justify-between items-center">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-bgs-gray-medium mb-1">Rendement cible</p>
                    <div className="flex items-center text-green-500 font-bold text-xl">
                      <TrendingUp className="h-5 w-5 mr-1" />
                      {project.yield}%
                    </div>
                  </div>
                  
                  <div className="h-12 w-0.5 bg-gray-200"></div>
                  
                  <div>
                    <p className="text-sm text-bgs-gray-medium mb-1">Durée</p>
                    <div className="flex items-center text-bgs-blue font-bold text-xl">
                      <Calendar className="h-5 w-5 mr-1 text-bgs-blue/70" />
                      {project.duration}
                    </div>
                  </div>
                  
                  <div className="h-12 w-0.5 bg-gray-200 hidden md:block"></div>
                  
                  <div className="hidden md:block">
                    <p className="text-sm text-bgs-gray-medium mb-1">Investissement min.</p>
                    <div className="flex items-center text-bgs-blue font-bold text-xl">
                      <DollarSign className="h-5 w-5 mr-1 text-bgs-blue/70" />
                      {project.minInvestment}€
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Partager">
                    <Share2 className="h-5 w-5 text-bgs-blue/70" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Télécharger la présentation">
                    <Download className="h-5 w-5 text-bgs-blue/70" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Project Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-gray-200">
              <button 
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "py-3 px-6 font-medium text-sm transition-colors border-b-2 -mb-px",
                  activeTab === 'overview' 
                    ? "border-bgs-orange text-bgs-orange" 
                    : "border-transparent text-bgs-blue/60 hover:text-bgs-blue"
                )}
              >
                Aperçu
              </button>
              <button 
                onClick={() => setActiveTab('documents')}
                className={cn(
                  "py-3 px-6 font-medium text-sm transition-colors border-b-2 -mb-px",
                  activeTab === 'documents' 
                    ? "border-bgs-orange text-bgs-orange" 
                    : "border-transparent text-bgs-blue/60 hover:text-bgs-blue"
                )}
              >
                Documents
              </button>
              <button 
                onClick={() => setActiveTab('updates')}
                className={cn(
                  "py-3 px-6 font-medium text-sm transition-colors border-b-2 -mb-px",
                  activeTab === 'updates' 
                    ? "border-bgs-orange text-bgs-orange" 
                    : "border-transparent text-bgs-blue/60 hover:text-bgs-blue"
                )}
              >
                Mises à jour
              </button>
            </div>
          </div>
          
          {/* Project Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-up">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-bgs-blue mb-4">À propos du projet</h2>
                    <p className="text-bgs-blue/80 mb-6 leading-relaxed">
                      {project.description}
                    </p>
                    
                    <p className="text-bgs-blue/80 mb-6 leading-relaxed">
                      Ce projet vise à acquérir et déployer {project.name} pour répondre aux besoins locaux croissants dans la région. Les équipements seront exploités par notre partenaire local qui possède une solide expérience dans ce secteur. L'accord de partenariat prévoit un partage des revenus qui assure un rendement attractif pour les investisseurs tout en garantissant une maintenance adéquate des équipements.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-bgs-blue mb-4">Points forts du projet</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex items-start">
                        <div className="shrink-0 mr-4 p-2 bg-green-50 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-bgs-blue mb-1">Rendement mensuel régulier</h3>
                          <p className="text-sm text-bgs-blue/70">Des revenus prévisibles distribués chaque mois</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="shrink-0 mr-4 p-2 bg-blue-50 rounded-lg">
                          <Shield className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-bgs-blue mb-1">Actif physique tangible</h3>
                          <p className="text-sm text-bgs-blue/70">Garantie matérielle pour votre investissement</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="shrink-0 mr-4 p-2 bg-purple-50 rounded-lg">
                          <Globe className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-bgs-blue mb-1">Impact économique local</h3>
                          <p className="text-sm text-bgs-blue/70">Soutien aux communautés et économies locales</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="shrink-0 mr-4 p-2 bg-orange-50 rounded-lg">
                          <Building className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-bgs-blue mb-1">Partenaires fiables</h3>
                          <p className="text-sm text-bgs-blue/70">Collaboration avec des entreprises locales établies</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-bgs-blue mb-4">Partenaire local</h2>
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-bgs-blue/10 rounded-full flex items-center justify-center mr-4">
                        <Building className="h-8 w-8 text-bgs-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-bgs-blue">{project.companyName} - Partenaire local</h3>
                        <p className="text-sm text-bgs-blue/70">{project.location}</p>
                      </div>
                    </div>
                    <p className="text-bgs-blue/80 mb-6 leading-relaxed">
                      Notre partenaire local pour ce projet est une entreprise établie depuis plus de 5 ans dans la région, avec une excellente réputation et une connaissance approfondie du marché local. Un contrat solide encadre notre collaboration pour garantir la protection des intérêts des investisseurs.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-3xl font-bold text-bgs-blue">5+</p>
                        <p className="text-sm text-bgs-blue/70">Années d'expérience</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-3xl font-bold text-bgs-blue">12</p>
                        <p className="text-sm text-bgs-blue/70">Employés locaux</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-3xl font-bold text-bgs-blue">8</p>
                        <p className="text-sm text-bgs-blue/70">Projets réalisés</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-3xl font-bold text-bgs-blue">98%</p>
                        <p className="text-sm text-bgs-blue/70">Taux de satisfaction</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-bgs-blue mb-4">FAQ</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-bgs-blue mb-2">Comment puis-je suivre la performance de mon investissement ?</h3>
                        <p className="text-bgs-blue/80">Vous recevrez des rapports mensuels détaillés dans votre tableau de bord personnel et des alertes par email pour tout événement important.</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-bgs-blue mb-2">Quand serai-je payé pour mon investissement ?</h3>
                        <p className="text-bgs-blue/80">Les dividendes sont versés mensuellement, généralement dans les 5 premiers jours du mois suivant.</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-bgs-blue mb-2">Puis-je visiter le projet sur place ?</h3>
                        <p className="text-bgs-blue/80">Oui, nous organisons des visites pour les investisseurs intéressés. Contactez notre équipe pour plus d'informations.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'documents' && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
                  <h2 className="text-xl font-semibold text-bgs-blue mb-6">Documents du projet</h2>
                  <div className="space-y-4">
                    {projectDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <div className="bg-bgs-blue/10 p-3 rounded-lg mr-4">
                            <FileText className="h-5 w-5 text-bgs-blue" />
                          </div>
                          <div>
                            <h3 className="font-medium text-bgs-blue">{doc.name}</h3>
                            <p className="text-sm text-bgs-blue/60">{doc.type} • {doc.size}</p>
                          </div>
                        </div>
                        <button className="flex items-center text-bgs-orange hover:text-bgs-orange-light transition-colors">
                          <Download className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Télécharger</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'updates' && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
                  <h2 className="text-xl font-semibold text-bgs-blue mb-6">Mises à jour du projet</h2>
                  <div className="space-y-6">
                    {projectUpdates.map((update, index) => (
                      <div key={index} className="relative pl-6 pb-6 border-l border-gray-200 last:pb-0">
                        <div className="absolute -left-1.5 top-0">
                          <div className="w-3 h-3 rounded-full bg-bgs-orange"></div>
                        </div>
                        <div>
                          <p className="text-sm text-bgs-blue/60 mb-1">{update.date}</p>
                          <h3 className="font-semibold text-bgs-blue mb-2">{update.title}</h3>
                          <p className="text-bgs-blue/80">{update.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-32 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-bgs-blue">Progression du financement</h3>
                    <span className="text-sm font-medium text-bgs-blue">
                      {project.fundingProgress}%
                    </span>
                  </div>
                  <Progress 
                    value={project.fundingProgress} 
                    size="lg"
                    showValue={true}
                    className="mb-2"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-bgs-blue">
                      <span className="font-medium">{Math.round(project.price * project.fundingProgress / 100).toLocaleString()} €</span> collectés
                    </span>
                    <span className="text-sm text-bgs-blue">
                      Objectif: <span className="font-medium">{project.price.toLocaleString()} €</span>
                    </span>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-bgs-blue">{remainingDays}</p>
                    <p className="text-xs text-bgs-blue/70">jours restants</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-bgs-blue">{investorCount}</p>
                    <p className="text-xs text-bgs-blue/70">investisseurs</p>
                  </div>
                </div>
                
                {/* Investment details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <div className="bg-bgs-blue/5 p-2 rounded-full mr-3">
                      <Calendar size={18} className="text-bgs-blue" />
                    </div>
                    <div>
                      <p className="text-sm text-bgs-blue/70">Durée du projet</p>
                      <p className="text-bgs-blue font-medium">{project.duration}</p>
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
                      <p className="text-bgs-blue font-medium">{project.minInvestment} €</p>
                    </div>
                  </div>
                </div>
                
                {/* Reassurance points */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center text-sm text-bgs-blue/80">
                    <CheckCircle size={16} className="text-green-500 mr-2 shrink-0" />
                    <span>Contrat d'investissement sécurisé</span>
                  </div>
                  <div className="flex items-center text-sm text-bgs-blue/80">
                    <CheckCircle size={16} className="text-green-500 mr-2 shrink-0" />
                    <span>Paiements mensuels réguliers</span>
                  </div>
                  <div className="flex items-center text-sm text-bgs-blue/80">
                    <CheckCircle size={16} className="text-green-500 mr-2 shrink-0" />
                    <span>Support dédié aux investisseurs</span>
                  </div>
                </div>
                
                {/* CTA */}
                <div>
                  <Link 
                    to="/login" 
                    className="w-full btn-primary justify-center mb-3"
                  >
                    Investir maintenant
                  </Link>
                  
                  <button 
                    className="w-full justify-center mb-6 py-3 px-4 border border-bgs-blue/20 rounded-lg text-bgs-blue font-medium hover:bg-bgs-blue/5 transition-colors flex items-center"
                  >
                    Contacter l'équipe projet
                  </button>
                  
                  <p className="text-xs text-center text-bgs-blue/60">
                    En investissant, vous acceptez les <Link to="/conditions-dutilisation" className="text-bgs-orange hover:underline">conditions générales</Link> et reconnaissez avoir lu notre <Link to="/politique-de-confidentialite" className="text-bgs-orange hover:underline">politique de confidentialité</Link>.
                  </p>
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
