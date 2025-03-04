
import { TrendingUp, ShieldCheck, Building2, Clock, DollarSign, Lock } from "lucide-react";

interface BenefitItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function BenefitItem({ icon, title, description, index }: BenefitItemProps) {
  return (
    <div 
      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all animate-fade-up"
      style={{ animationDelay: `${0.1 * index}s` }}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  );
}

export default function BenefitsSection() {
  const benefits = [
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
  ];

  return (
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
          {benefits.map((benefit, index) => (
            <BenefitItem 
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
