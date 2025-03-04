
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Globe, Users, TrendingUp } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-32 pb-20">
        {/* Hero section */}
        <section className="container px-4 md:px-6 mx-auto mb-20">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <h1 className="mb-6">
              <span className="text-bgs-blue">À propos de</span>{" "}
              <span className="text-gradient">BGS Business Club</span>
            </h1>
            <p className="text-xl text-bgs-blue/80 max-w-3xl mx-auto">
              Découvrez notre mission, notre vision et comment nous transformons l'investissement en Afrique
            </p>
          </div>
        </section>
        
        {/* About BGS */}
        <section className="py-20 bg-bgs-gray-light relative overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-bgs-blue/5 blur-3xl" />
          <div className="absolute -bottom-[30%] -left-[10%] w-[600px] h-[600px] rounded-full bg-bgs-orange/5 blur-3xl" />
          
          <div className="container px-4 md:px-6 mx-auto relative">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-up">
                <img
                  src="lovable-uploads/d9a3204a-06aa-470d-8255-7f3bd0852557.png"
                  alt="BGS Business Club"
                  className="h-24 mb-8"
                />
                <h2 className="text-3xl font-bold text-bgs-blue mb-6">
                  Notre histoire
                </h2>
                <div className="space-y-4 text-bgs-blue/80">
                  <p>
                    BGS Business Club est né d'une vision simple mais puissante : créer un pont entre les investisseurs et les opportunités économiques en Afrique, tout en soutenant le développement local.
                  </p>
                  <p>
                    Fondé par des entrepreneurs passionnés ayant une expérience approfondie du continent africain, notre club d'investissement offre une approche innovante basée sur l'acquisition d'actifs physiques productifs.
                  </p>
                  <p>
                    Notre modèle unique permet aux investisseurs de participer directement au développement économique africain tout en générant des rendements attractifs, créant ainsi une situation gagnant-gagnant pour tous les acteurs impliqués.
                  </p>
                </div>
              </div>
              
              <div className="glass-card p-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <h3 className="text-2xl font-semibold mb-6 text-bgs-blue">Notre mission</h3>
                
                <div className="space-y-6">
                  {[
                    {
                      icon: <Globe size={32} className="text-bgs-orange" />,
                      title: "Développer l'économie locale",
                      description: "Faciliter l'accès aux équipements essentiels pour les entreprises africaines afin de stimuler la production et créer des emplois."
                    },
                    {
                      icon: <TrendingUp size={32} className="text-bgs-orange" />,
                      title: "Offrir des rendements attractifs",
                      description: "Proposer aux investisseurs des opportunités de placement à fort rendement adossées à des actifs réels et productifs."
                    },
                    {
                      icon: <ShieldCheck size={32} className="text-bgs-orange" />,
                      title: "Assurer la sécurité des investissements",
                      description: "Garantir la protection du capital investi grâce à la propriété des actifs et une gestion rigoureuse des projets."
                    },
                    {
                      icon: <Users size={32} className="text-bgs-orange" />,
                      title: "Créer une communauté d'investisseurs",
                      description: "Rassembler des personnes partageant la même vision pour démocratiser l'investissement en Afrique."
                    }
                  ].map((mission, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">{mission.icon}</div>
                      <div>
                        <h4 className="text-lg font-semibold mb-1">{mission.title}</h4>
                        <p className="text-bgs-blue/80">{mission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Advantages */}
        <section className="py-20 container px-4 md:px-6 mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="mb-4 animate-fade-up">
              <span className="text-gradient">Pourquoi nous faire confiance</span>
            </h2>
            <p className="text-xl text-bgs-blue/80 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Les avantages qui font la différence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Expertise locale",
                description: "Notre équipe possède une connaissance approfondie des marchés africains et des relations solides avec les acteurs locaux."
              },
              {
                title: "Transparence totale",
                description: "Vous êtes informés à chaque étape du processus, avec un suivi détaillé de vos investissements et de leurs performances."
              },
              {
                title: "Actifs tangibles",
                description: "Contrairement aux investissements immatériels, votre capital est converti en équipements physiques dont vous êtes propriétaire."
              },
              {
                title: "Impact social positif",
                description: "Votre investissement contribue directement à la création d'emplois et au développement économique des communautés locales."
              },
              {
                title: "Rendements supérieurs",
                description: "Nos projets offrent des rendements significativement plus élevés que les placements traditionnels, avec des retours mensuels."
              },
              {
                title: "Flexibilité",
                description: "Choisissez parmi différents projets et montants d'investissement selon vos objectifs financiers et votre horizon de placement."
              }
            ].map((advantage, index) => (
              <div 
                key={index} 
                className="glass-card p-6 hover:shadow-premium transition-all animate-fade-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <h3 className="text-xl font-semibold mb-3 text-bgs-blue">{advantage.title}</h3>
                <p className="text-bgs-blue/80">{advantage.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* CTA */}
        <section className="bg-bgs-blue text-white py-20 relative overflow-hidden">
          <div className="absolute -top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-bgs-orange/20 blur-3xl" />
          
          <div className="container px-4 md:px-6 mx-auto relative">
            <div className="max-w-4xl mx-auto text-center animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Prêt à rejoindre l'aventure ?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
                Commencez dès aujourd'hui votre parcours d'investisseur avec BGS Business Club et participez à des projets à fort impact en Afrique.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register" className="bg-bgs-orange hover:bg-bgs-orange-light text-white font-medium px-8 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Créez votre compte
                </Link>
                <Link to="/projects" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium px-8 py-3 rounded-lg border border-white/20 transition-all">
                  Découvrir les projets
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer section would go here - same as in other pages */}
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
