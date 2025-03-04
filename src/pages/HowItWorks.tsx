
import { useEffect } from "react";
import { 
  UserCheck, 
  Building2, 
  HandCoins, 
  ChartBar, 
  ArrowDownToLine, 
  CircleArrowUp,
  CircleCheck 
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import InfoSection from "@/components/ui/InfoSection";

export default function HowItWorks() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Steps for the investment process
  const investmentSteps = [
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
    {
      title: "Suivi des rendements",
      description: "Consultez régulièrement les performances de vos investissements depuis votre tableau de bord.",
      icon: <ChartBar size={32} />,
    },
    {
      title: "Perception des revenus",
      description: "Recevez mensuellement votre part des bénéfices générés par les actifs financés.",
      icon: <ArrowDownToLine size={32} />,
    },
    {
      title: "Retrait des bénéfices",
      description: "Retirez vos bénéfices quand vous le souhaitez par virement bancaire.",
      icon: <CircleArrowUp size={32} />,
    },
  ];

  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-32 pb-20">
        {/* Hero section */}
        <section className="container px-4 md:px-6 mx-auto mb-20">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <h1 className="mb-6">
              <span className="text-bgs-blue">Comment ça</span>{" "}
              <span className="text-gradient">marche</span>
            </h1>
            <p className="text-xl text-bgs-blue/80 max-w-3xl mx-auto">
              Découvrez comment BGS Business Club vous permet d'investir facilement dans des actifs physiques en Afrique et de générer des rendements attractifs.
            </p>
          </div>
        </section>
        
        {/* Investment Process */}
        <InfoSection
          title="Processus d'investissement"
          subtitle="Un parcours simple en 6 étapes pour investir et percevoir vos rendements"
          steps={investmentSteps}
        />
        
        {/* Business model explanation */}
        <section className="py-20 bg-bgs-gray-light relative overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-bgs-blue/5 blur-3xl" />
          <div className="absolute -bottom-[30%] -left-[10%] w-[600px] h-[600px] rounded-full bg-bgs-orange/5 blur-3xl" />
          
          <div className="container px-4 md:px-6 mx-auto relative">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="mb-4 animate-fade-up">
                <span className="text-gradient">Notre modèle économique</span>
              </h2>
              <p className="text-xl text-bgs-blue/80 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                Comprendre comment votre investissement génère des rendements
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="glass-card p-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <h3 className="text-2xl font-semibold mb-6 text-bgs-blue">Comment nous générons des rendements</h3>
                
                <ul className="space-y-4">
                  {[
                    "Nous identifions des entreprises africaines ayant besoin d'équipements spécifiques",
                    "Vos investissements servent à acheter ces équipements qui restent la propriété des investisseurs",
                    "Les entreprises louent ces équipements et les utilisent pour générer des revenus",
                    "Une part des bénéfices générés est reversée aux investisseurs mensuellement",
                    "Le capital investi peut être récupéré à la fin de la période d'investissement"
                  ].map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CircleCheck size={20} className="text-bgs-orange flex-shrink-0 mt-1" />
                      <p className="text-bgs-blue/80">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="glass-card p-6">
                  <h4 className="text-lg font-semibold mb-2 text-bgs-blue">Exemple concret: BGS Wood Africa</h4>
                  <p className="text-bgs-blue/80 mb-4">
                    Investissement dans des tronçonneuses à 1 500 € permettant de générer 15% de rendement mensuel.
                  </p>
                  <div className="bg-bgs-blue/5 rounded-lg p-4">
                    <p className="font-semibold text-bgs-blue">Pour un investissement de 1 500 €:</p>
                    <ul className="mt-2 space-y-1 text-bgs-blue/80">
                      <li>• Rendement mensuel: 225 € (15%)</li>
                      <li>• Rendement annuel: 2 700 € (180%)</li>
                      <li>• Retour sur investissement: 6-7 mois</li>
                    </ul>
                  </div>
                </div>
                
                <div className="glass-card p-6">
                  <h4 className="text-lg font-semibold mb-2 text-bgs-blue">Sécurité de votre investissement</h4>
                  <ul className="space-y-3">
                    {[
                      "Vous êtes propriétaire des actifs physiques achetés",
                      "BGS Groupe supervise l'utilisation des équipements",
                      "Contrats solides avec les entreprises bénéficiaires",
                      "Diversification possible sur plusieurs projets"
                    ].map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CircleCheck size={20} className="text-bgs-orange flex-shrink-0 mt-1" />
                        <p className="text-bgs-blue/80">{point}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ section */}
        <section className="py-20 container px-4 md:px-6 mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="mb-4 animate-fade-up">
              <span className="text-gradient">Questions fréquentes</span>
            </h2>
            <p className="text-xl text-bgs-blue/80 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Tout ce que vous devez savoir sur l'investissement avec BGS Business Club
            </p>
          </div>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            {[
              {
                question: "Quel est le montant minimum d'investissement ?",
                answer: "Le montant minimum d'investissement varie selon les projets. Pour BGS Wood Africa, il est de 1 500 € correspondant au prix d'une tronçonneuse. D'autres projets peuvent avoir des seuils différents."
              },
              {
                question: "Comment sont sécurisés mes investissements ?",
                answer: "Vos investissements sont sécurisés par la propriété des actifs physiques achetés. De plus, BGS Groupe supervise l'utilisation des équipements et établit des contrats solides avec les entreprises bénéficiaires."
              },
              {
                question: "Quand puis-je percevoir mes rendements ?",
                answer: "Les rendements sont généralement versés mensuellement, à partir du premier mois suivant votre investissement. Ils sont calculés en pourcentage du montant investi."
              },
              {
                question: "Puis-je retirer mon investissement initial ?",
                answer: "Oui, vous pouvez retirer votre investissement initial après une période définie, généralement à partir de 6 mois selon le projet. Les conditions spécifiques sont indiquées dans chaque opportunité d'investissement."
              },
              {
                question: "Quels sont les risques liés à ces investissements ?",
                answer: "Comme tout investissement, il existe des risques liés aux conditions économiques, à la gestion des équipements et aux performances des entreprises bénéficiaires. BGS Business Club travaille à minimiser ces risques grâce à une sélection rigoureuse des projets et une supervision constante."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className="glass-card p-6 animate-fade-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <h4 className="text-xl font-semibold mb-2 text-bgs-blue">{faq.question}</h4>
                <p className="text-bgs-blue/80">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center animate-fade-up" style={{ animationDelay: "0.6s" }}>
            <p className="text-bgs-blue/80 mb-4">
              Vous avez d'autres questions ? N'hésitez pas à nous contacter.
            </p>
            <Link to="/contact" className="btn-primary">
              Contactez-nous
            </Link>
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
