
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  Clock, 
  DollarSign, 
  HandCoins, 
  CircleArrowDown,
  UserCheck,
  Lock
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import HeaderSection from "@/components/ui/HeaderSection";
import InfoSection from "@/components/ui/InfoSection";
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

// How it works steps
const howItWorksSteps = [
  {
    title: "Inscription & Dépôt",
    description: "Créez votre compte et effectuez un dépôt par virement bancaire pour commencer à investir.",
    icon: <UserCheck size={32} />,
  },
  {
    title: "Choisissez un projet",
    description: "Parcourez les différents projets disponibles et sélectionnez celui qui correspond à vos objectifs.",
    icon: <Building2 size={32} />,
  },
  {
    title: "Investissez",
    description: "Définissez le montant que vous souhaitez investir et confirmez votre participation au projet.",
    icon: <HandCoins size={32} />,
  },
];

export default function Index() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main>
        <HeaderSection 
          title="Investissez dans des actifs physiques en Afrique"
          subtitle="BGS Business Club vous permet d'acheter des machines et équipements pour les louer à des entreprises africaines et percevoir une part des bénéfices générés."
        />
        
        {/* Featured Projects */}
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
        
        {/* How it works */}
        <InfoSection
          title="Comment ça marche"
          subtitle="Un processus simple pour investir et générer des rendements"
          steps={howItWorksSteps}
        />
        
        {/* Benefits */}
        <section className="py-20 bg-bgs-blue text-white relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white to-transparent" />
          <div className="absolute -top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-bgs-orange/20 blur-3xl" />
          
          <div className="container px-4 md:px-6 mx-auto relative">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="mb-4 text-white animate-fade-up">
                Pourquoi investir avec <span className="text-bgs-orange">BGS Business Club</span>
              </h2>
              <p className="text-xl text-white/80 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                Découvrez les avantages de notre modèle d'investissement unique
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <TrendingUp size={32} className="text-bgs-orange" />,
                  title: "Rendements attractifs",
                  description: "Bénéficiez de rendements élevés, à partir de 12% annualisés sur vos investissements."
                },
                {
                  icon: <ShieldCheck size={32} className="text-bgs-orange" />,
                  title: "Actifs physiques",
                  description: "Vos investissements sont adossés à des actifs physiques réels et productifs."
                },
                {
                  icon: <DollarSign size={32} className="text-bgs-orange" />,
                  title: "Rentabilité rapide",
                  description: "Commencez à percevoir des revenus dès le premier mois après votre investissement."
                },
                {
                  icon: <Lock size={32} className="text-bgs-orange" />,
                  title: "Sécurité",
                  description: "Les actifs sont gérés par des experts avec une expérience confirmée en Afrique."
                },
                {
                  icon: <Building2 size={32} className="text-bgs-orange" />,
                  title: "Impact social",
                  description: "Contribuez au développement économique et à la création d'emplois en Afrique."
                },
                {
                  icon: <Clock size={32} className="text-bgs-orange" />,
                  title: "Flexibilité",
                  description: "Choisissez la durée de votre investissement selon vos objectifs financiers."
                }
              ].map((benefit, index) => (
                <div 
                  key={index} 
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all animate-fade-up"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-white/80">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute -top-[30%] -left-[10%] w-[600px] h-[600px] rounded-full bg-bgs-orange/5 blur-3xl" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-bgs-blue/5 blur-3xl" />
          
          <div className="container px-4 md:px-6 mx-auto">
            <div className="glass-card p-8 md:p-12 max-w-5xl mx-auto text-center relative overflow-hidden animate-fade-up">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bgs-blue via-bgs-orange to-bgs-blue-light" />
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Prêt à commencer votre parcours d'investisseur ?
              </h2>
              <p className="text-xl text-bgs-blue/80 mb-8 max-w-3xl mx-auto">
                Créez votre compte gratuitement et découvrez comment investir dans des projets à fort potentiel en Afrique.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register" className="btn-primary group">
                  Créez votre compte
                  <CircleArrowDown size={18} className="ml-2 transition-transform group-hover:translate-y-1" />
                </Link>
                <Link to="/how-it-works" className="btn-secondary">
                  En savoir plus
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
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
                  <li>
                    <Link to="/" className="text-white/70 hover:text-white transition-colors">
                      Accueil
                    </Link>
                  </li>
                  <li>
                    <Link to="/projects" className="text-white/70 hover:text-white transition-colors">
                      Projets
                    </Link>
                  </li>
                  <li>
                    <Link to="/how-it-works" className="text-white/70 hover:text-white transition-colors">
                      Comment ça marche
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="text-white/70 hover:text-white transition-colors">
                      À propos
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Ressources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link to="/faq" className="text-white/70 hover:text-white transition-colors">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-white/70 hover:text-white transition-colors">
                      Conditions d'utilisation
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-white/70 hover:text-white transition-colors">
                      Politique de confidentialité
                    </Link>
                  </li>
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
      </main>
    </div>
  );
}
