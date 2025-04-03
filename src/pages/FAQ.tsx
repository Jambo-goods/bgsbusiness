
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Données des FAQ
const faqItems = {
  general: [
    {
      question: "Qu'est-ce que BGS Business ?",
      answer: "BGS Business est une plateforme d'investissement qui permet à des particuliers d'investir dans des actifs physiques en Afrique et de percevoir une part des bénéfices générés. Nous facilitons l'achat de machines et d'équipements qui sont ensuite loués à des entreprises africaines."
    },
    {
      question: "Comment fonctionne le modèle d'investissement de BGS Business ?",
      answer: "Notre modèle est basé sur l'acquisition d'actifs physiques (machines, équipements) qui sont ensuite mis à disposition d'entreprises africaines sous forme de location. Les revenus générés par ces locations sont partagés avec les investisseurs, créant ainsi un flux de revenus passifs."
    },
    {
      question: "Quel est le montant minimal pour investir ?",
      answer: "Le montant minimal d'investissement varie selon les projets, mais commence généralement à partir de 1 000 €. Certains projets peuvent proposer des tickets d'entrée plus accessibles."
    },
    {
      question: "BGS Business est-il réglementé ?",
      answer: "Oui, BGS Business opère en conformité avec les réglementations financières françaises et européennes. Nous sommes enregistrés auprès des autorités compétentes et respectons les obligations légales en matière d'investissement et de protection des consommateurs."
    }
  ],
  investments: [
    {
      question: "Quels types de projets sont disponibles pour investissement ?",
      answer: "Nous proposons des investissements dans divers secteurs en Afrique, notamment l'agriculture, la logistique, la production, l'énergie et les infrastructures. Chaque projet est soigneusement sélectionné pour son potentiel de rendement et son impact positif."
    },
    {
      question: "Comment sont sélectionnés les projets sur la plateforme ?",
      answer: "Nos projets passent par un processus rigoureux de due diligence. Nous évaluons la viabilité économique, l'équipe dirigeante, l'impact social et environnemental, ainsi que les risques potentiels. Seuls les projets répondant à nos critères stricts sont présentés sur la plateforme."
    },
    {
      question: "Quelle est la durée moyenne d'un investissement ?",
      answer: "La durée des investissements varie généralement entre 3 et 5 ans, selon le type de projet. Certains projets peuvent avoir des durées plus courtes ou plus longues, toutes les informations spécifiques sont détaillées dans la description de chaque opportunité."
    },
    {
      question: "Quel est le rendement attendu des investissements ?",
      answer: "Les rendements varient selon les projets, mais se situent généralement entre 8% et 15% par an. Ces chiffres sont des projections basées sur nos analyses et peuvent varier en fonction des performances réelles du projet."
    }
  ],
  account: [
    {
      question: "Comment créer un compte sur BGS Business ?",
      answer: "Pour créer un compte, cliquez sur 'Inscription' en haut à droite de notre site. Vous devrez fournir quelques informations personnelles et suivre le processus de vérification d'identité conformément aux réglementations en vigueur (KYC)."
    },
    {
      question: "Comment puis-je suivre mes investissements ?",
      answer: "Une fois connecté à votre compte, vous pouvez accéder à votre tableau de bord qui présente tous vos investissements actifs. Vous y trouverez des informations détaillées sur chaque projet, les rendements générés, et les paiements programmés."
    },
    {
      question: "Comment fonctionne le processus de vérification d'identité ?",
      answer: "Le processus KYC (Know Your Customer) implique la vérification de votre identité via la soumission d'une pièce d'identité officielle et d'un justificatif de domicile. Cette procédure est obligatoire pour prévenir la fraude et respecter les réglementations financières."
    }
  ],
  payments: [
    {
      question: "Quelles méthodes de paiement acceptez-vous ?",
      answer: "Nous acceptons les virements bancaires, les paiements par carte bancaire, et certains portefeuilles électroniques. Les détails des méthodes disponibles sont présentés lors du processus d'investissement."
    },
    {
      question: "À quelle fréquence sont versés les rendements ?",
      answer: "La fréquence des versements dépend de chaque projet. Généralement, les rendements sont distribués trimestriellement ou semestriellement. Les détails précis sont spécifiés dans la description de chaque opportunité d'investissement."
    },
    {
      question: "Comment puis-je retirer mes fonds ?",
      answer: "Vous pouvez demander un retrait depuis votre tableau de bord. Les retraits sont généralement traités dans un délai de 3 à 5 jours ouvrables et sont effectués vers le compte bancaire enregistré dans votre profil."
    }
  ],
  risks: [
    {
      question: "Quels sont les risques liés à l'investissement en Afrique ?",
      answer: "Les investissements en Afrique comportent des risques spécifiques comme l'instabilité politique dans certaines régions, les fluctuations monétaires, ou les défis logistiques. Cependant, nous sélectionnons soigneusement nos projets et partenaires locaux pour minimiser ces risques."
    },
    {
      question: "Comment BGS Business gère-t-il les risques ?",
      answer: "Nous mettons en place plusieurs mesures pour gérer les risques : diversification géographique et sectorielle, due diligence approfondie, contrats solides avec les partenaires locaux, assurances spécifiques, et suivi régulier des projets avec des audits périodiques."
    },
    {
      question: "Mes investissements sont-ils garantis ?",
      answer: "Non, comme pour tout investissement, il n'y a pas de garantie absolue. Cependant, nous investissons dans des actifs physiques qui conservent une valeur intrinsèque et travaillons avec des partenaires fiables pour minimiser les risques."
    }
  ],
  contact: [
    {
      question: "Comment contacter le support client ?",
      answer: "Vous pouvez contacter notre équipe de support client par email à contact@bgsbusiness.com, par téléphone au +33 1 23 45 67 89 du lundi au vendredi de 9h à 18h, ou via le formulaire de contact disponible sur notre site."
    },
    {
      question: "Quel est le délai de réponse habituel du support ?",
      answer: "Nous nous efforçons de répondre à toutes les demandes dans un délai de 24 à 48 heures ouvrables. Pour les questions urgentes, nous vous recommandons de nous contacter par téléphone."
    },
    {
      question: "Puis-je prendre rendez-vous pour discuter de mes investissements ?",
      answer: "Oui, nos conseillers en investissement sont disponibles pour des rendez-vous personnalisés. Vous pouvez prendre rendez-vous via votre espace client ou en contactant directement notre service client."
    }
  ]
};

export default function FAQ() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [filteredFAQs, setFilteredFAQs] = useState(faqItems.general);

  useEffect(() => {
    if (searchTerm) {
      // Recherche dans toutes les catégories
      const allFAQs = Object.values(faqItems).flat();
      const results = allFAQs.filter(item => 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFAQs(results);
    } else {
      // Afficher les FAQs de la catégorie sélectionnée ou rediriger vers le centre d'aide si c'est "contact"
      if (activeTab === "contact") {
        // Pour éviter l'erreur, on définit un tableau vide pour contact quand il est sélectionné via le tab
        // mais avant la redirection
        setFilteredFAQs(faqItems[activeTab as keyof typeof faqItems] || []);
      } else {
        setFilteredFAQs(faqItems[activeTab as keyof typeof faqItems] || []);
      }
    }
  }, [searchTerm, activeTab]);

  const handleTabChange = (value: string) => {
    if (value === "contact") {
      // Si l'onglet "Contact" est sélectionné, nous ne changeons pas l'activeTab 
      // mais nous redirigeons l'utilisateur
      window.location.href = '/centre-daide';
    } else {
      setActiveTab(value);
      setSearchTerm("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Foire Aux Questions | BGS Business</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-bgs-blue mb-8">Foire Aux Questions</h1>

        {/* Barre de recherche */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Rechercher une question..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="general" value={activeTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full mb-8">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="investments">Investissements</TabsTrigger>
            <TabsTrigger value="account">Compte</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="risks">Risques</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* Contenu des FAQs */}
          <div className="space-y-4">
            {searchTerm && filteredFAQs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun résultat trouvé pour "{searchTerm}"</p>
                <p className="mt-2">Essayez un autre terme ou consultez notre <a href="/centre-daide" className="text-bgs-orange">Centre d'aide</a>.</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {Array.isArray(filteredFAQs) && filteredFAQs.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-bgs-blue font-medium">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-bgs-blue/80">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </Tabs>
        
        {/* Contact */}
        <div className="bg-gray-50 p-6 rounded-lg mt-12 text-center">
          <h2 className="text-xl font-semibold text-bgs-blue mb-2">Vous n'avez pas trouvé de réponse ?</h2>
          <p className="text-bgs-blue/80 mb-4">Notre équipe d'assistance est prête à vous aider</p>
          <a 
            href="/centre-daide"
            className="inline-block bg-bgs-blue text-white px-6 py-2 rounded-md hover:bg-bgs-blue/90 transition-colors"
          >
            Contacter le support
          </a>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
