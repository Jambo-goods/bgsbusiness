
import React, { useState } from "react";
import { TrendingUp, Shield, Globe, Building, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Project } from "@/types/project";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { formatCurrency } from "@/utils/currencyUtils";

interface ProjectOverviewTabProps {
  project: Project;
}

export default function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "Comment puis-je suivre la performance de mon investissement ?",
      answer: "Vous recevrez des rapports mensuels détaillés dans votre tableau de bord personnel et des alertes par email pour tout événement important. Notre plateforme vous permet également de visualiser en temps réel les statistiques clés de votre investissement."
    },
    {
      question: "Quand serai-je payé pour mon investissement ?",
      answer: "Les dividendes sont versés mensuellement, généralement dans les 5 premiers jours du mois suivant. Vous pouvez choisir de réinvestir automatiquement ces dividendes ou de les recevoir sur votre compte bancaire."
    },
    {
      question: "Puis-je visiter le projet sur place ?",
      answer: "Oui, nous organisons des visites pour les investisseurs intéressés. Contactez notre équipe pour plus d'informations et pour planifier une visite adaptée à votre emploi du temps."
    },
    {
      question: "Quelle est la durée minimale d'investissement ?",
      answer: "La durée minimale recommandée est de 12 mois pour bénéficier pleinement des rendements. Cependant, notre plateforme offre une liquidité facilitée si vous avez besoin de récupérer votre investissement avant terme."
    }
  ];

  const defaultInvestmentSteps = [
    {
      number: "1️⃣",
      title: "Acquisition des Actifs",
      description: "Les fonds collectés servent à acquérir les équipements et infrastructures nécessaires au projet."
    },
    {
      number: "2️⃣",
      title: "Attribution des Parts",
      description: "Chaque investisseur devient propriétaire d'une part des actifs pour la durée de l'investissement."
    },
    {
      number: "3️⃣",
      title: "Exploitation par notre Partenaire",
      description: "Notre partenaire local exploite les équipements et génère des revenus réguliers."
    },
    {
      number: "4️⃣",
      title: "Distribution des Rendements",
      description: "Les investisseurs reçoivent un rendement mensuel fixe pendant toute la durée du projet."
    },
    {
      number: "5️⃣",
      title: "Options de Sortie",
      description: "À la fin de la période, l'investisseur peut renouveler son engagement ou récupérer son capital initial."
    }
  ];

  let investmentSteps = defaultInvestmentSteps;
  
  if (project.investment_model) {
    try {
      const steps = project.investment_model.split(/\d️⃣/).filter(step => step.trim().length > 0);
      
      if (steps.length > 0) {
        investmentSteps = steps.map((step, index) => {
          const parts = step.split(':');
          let title = '';
          let description = '';
          
          if (parts.length > 1) {
            title = parts[0].trim();
            description = parts.slice(1).join(':').trim();
          } else {
            description = step.trim();
          }
          
          return {
            number: `${index + 1}️⃣`,
            title,
            description
          };
        });
      }
    } catch (error) {
      console.error("Erreur lors du parsing du modèle d'investissement:", error);
    }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
        <h2 className="text-xl font-semibold text-bgs-blue mb-4">À propos du projet</h2>
        <p className="text-base text-bgs-blue/80 mb-5 leading-relaxed">
          {project.description}
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
        <h2 className="text-xl font-semibold text-bgs-blue mb-5">Détails du Financement</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-bgs-blue/60">Investissement Minimum</p>
            <p className="text-lg font-semibold text-bgs-blue">{formatCurrency(project.min_investment || 500)}</p>
          </div>
          
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-bgs-blue/60">Rendement Mensuel</p>
            <p className="text-lg font-semibold text-green-600">{project.yield_rate || project.yield || 8}%</p>
          </div>
          
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-bgs-blue/60">Durée de l'Investissement</p>
            <p className="text-lg font-semibold text-bgs-blue">{project.duration || "12 mois"}</p>
          </div>
          
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-bgs-blue/60">Actif sous-jacent</p>
            <p className="text-lg font-semibold text-bgs-blue">{project.underlying_asset || "Non spécifié"}</p>
          </div>
          
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-bgs-blue/60">Premier Versement</p>
            <p className="text-lg font-semibold text-bgs-blue">Après {project.firstPaymentDelayMonths || 1} mois</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
        <h2 className="text-xl font-semibold text-bgs-blue mb-5">Modèle d'Investissement</h2>
        
        <div className="space-y-4">
          {investmentSteps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bgs-blue flex items-center justify-center text-white font-semibold">
                {index + 1}
              </div>
              <div>
                <h3 className="font-medium text-lg text-bgs-blue mb-1">{step.title}</h3>
                <p className="text-sm text-bgs-blue/80">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
        <h2 className="text-xl font-semibold text-bgs-blue mb-5">Points forts du projet</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start group hover:bg-gray-50 p-4 rounded-lg transition-colors">
            <div className="shrink-0 mr-4 p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-bgs-blue mb-2">Rendement mensuel régulier</h3>
              <p className="text-sm text-bgs-blue/70">Des revenus prévisibles distribués chaque mois</p>
            </div>
          </div>
          
          <div className="flex items-start group hover:bg-gray-50 p-4 rounded-lg transition-colors">
            <div className="shrink-0 mr-4 p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Shield className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-bgs-blue mb-2">Actif physique tangible</h3>
              <p className="text-sm text-bgs-blue/70">Garantie matérielle pour votre investissement</p>
            </div>
          </div>
          
          <div className="flex items-start group hover:bg-gray-50 p-4 rounded-lg transition-colors">
            <div className="shrink-0 mr-4 p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
              <Globe className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-bgs-blue mb-2">Impact économique local</h3>
              <p className="text-sm text-bgs-blue/70">Soutien aux communautés et économies locales</p>
            </div>
          </div>
          
          <div className="flex items-start group hover:bg-gray-50 p-4 rounded-lg transition-colors">
            <div className="shrink-0 mr-4 p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
              <Building className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-bgs-blue mb-2">Partenaires fiables</h3>
              <p className="text-sm text-bgs-blue/70">Collaboration avec des entreprises locales établies</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
        <h2 className="text-xl font-semibold text-bgs-blue mb-5">Partenaire local</h2>
        <div className="flex items-center mb-5">
          <div className="w-16 h-16 bg-bgs-blue/10 rounded-full flex items-center justify-center mr-4">
            <Building className="h-8 w-8 text-bgs-blue" />
          </div>
          <div>
            <h3 className="font-medium text-lg text-bgs-blue">{project.company_name} - Partenaire local</h3>
            <p className="text-sm text-bgs-blue/70">{project.location}</p>
          </div>
        </div>
        <p className="text-base text-bgs-blue/80 mb-6 leading-relaxed">
          {project.partner_description || 'Notre partenaire local pour ce projet est une entreprise établie depuis plus de 5 ans dans la région, avec une excellente réputation et une connaissance approfondie du marché local. Un contrat solide encadre notre collaboration pour garantir la protection des intérêts des investisseurs.'}
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <p className="text-2xl font-bold text-bgs-blue">{project.partner_experience || '5+'}</p>
            <p className="text-sm text-bgs-blue/70">Années d'expérience</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <p className="text-2xl font-bold text-bgs-blue">{project.partner_employees || '12'}</p>
            <p className="text-sm text-bgs-blue/70">Employés locaux</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <p className="text-2xl font-bold text-bgs-blue">{project.partner_projects || '8'}</p>
            <p className="text-sm text-bgs-blue/70">Projets réalisés</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <p className="text-2xl font-bold text-bgs-blue">{project.partner_satisfaction || '98'}%</p>
            <p className="text-sm text-bgs-blue/70">Taux de satisfaction</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
        <div className="flex items-center mb-5">
          <div className="bg-bgs-orange/10 p-3 rounded-full mr-4">
            <HelpCircle className="h-5 w-5 text-bgs-orange" />
          </div>
          <h2 className="text-xl font-semibold text-bgs-blue">Questions fréquentes</h2>
        </div>
        
        <div className="mt-4">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-100 last:border-0">
                <AccordionTrigger className="py-4 text-base font-medium text-bgs-blue hover:text-bgs-orange hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-bgs-blue/80 leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
