import React, { useState } from "react";
import { TrendingUp, Shield, Globe, Building, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Project } from "@/types/project";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

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

  return (
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
        <div className="flex items-center mb-5">
          <div className="bg-bgs-orange/10 p-2 rounded-full mr-3">
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
