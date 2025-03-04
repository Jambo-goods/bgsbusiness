
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search } from "lucide-react";

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const faqItems = [
    {
      question: "Comment fonctionne BGS Business Club ?",
      answer: "BGS Business Club est une plateforme qui permet aux investisseurs de participer à des projets d'acquisition d'actifs physiques productifs en Afrique. Nous identifions des opportunités, sécurisons les actifs, et assurons leur gestion opérationnelle pour générer des revenus qui sont ensuite redistribués aux investisseurs."
    },
    {
      question: "Quel est le montant minimum pour investir ?",
      answer: "Le montant minimum d'investissement varie selon les projets, mais commence généralement à partir de 1 500 €. Chaque projet a ses propres critères et vous pouvez consulter ces informations dans la description détaillée de chaque opportunité."
    },
    {
      question: "Comment sont sécurisés mes investissements ?",
      answer: "Vos investissements sont sécurisés par la propriété des actifs physiques acquis. De plus, nous travaillons avec des partenaires locaux fiables et mettons en place des contrats solides pour protéger vos intérêts. Notre modèle repose sur la transparence et la traçabilité de chaque opération."
    },
    {
      question: "Quels sont les rendements attendus ?",
      answer: "Les rendements varient selon les projets, mais se situent généralement entre 12% et 15% annualisés. Ces chiffres sont basés sur les performances réelles de nos projets en cours et tiennent compte des coûts opérationnels et de notre commission de gestion."
    },
    {
      question: "Quand vais-je recevoir mes premiers revenus ?",
      answer: "La plupart de nos projets commencent à générer des revenus dès le premier mois suivant l'investissement. Les distributions sont effectuées mensuellement directement sur votre compte bancaire ou peuvent être réinvesties dans d'autres projets selon votre choix."
    },
    {
      question: "Puis-je retirer mon investissement à tout moment ?",
      answer: "Les conditions de retrait dépendent du projet dans lequel vous avez investi. Certains projets offrent une flexibilité totale avec possibilité de retrait à tout moment (sous réserve d'un préavis), tandis que d'autres ont une durée d'engagement minimale. Ces conditions sont clairement indiquées dans la description de chaque projet."
    },
    {
      question: "Quels sont les risques associés à ces investissements ?",
      answer: "Comme tout investissement, il existe des risques, notamment liés aux conditions économiques locales, à la gestion opérationnelle des actifs, et aux fluctuations des marchés. Nous atténuons ces risques par une sélection rigoureuse des projets, une diversification géographique, et une gestion professionnelle des opérations."
    },
    {
      question: "Comment suivre la performance de mes investissements ?",
      answer: "Une fois inscrit, vous aurez accès à un tableau de bord personnel qui vous permettra de suivre en temps réel la performance de vos investissements, les revenus générés, et l'état de vos actifs. Nous envoyons également des rapports mensuels détaillés par email."
    },
    {
      question: "Quels sont les frais appliqués ?",
      answer: "BGS Business Club prélève une commission de gestion qui varie entre 2% et 3% des revenus générés par les actifs. Nous ne facturons pas de frais d'entrée ni de frais cachés. Notre modèle est basé sur l'alignement de nos intérêts avec ceux de nos investisseurs."
    },
    {
      question: "Comment puis-je commencer à investir ?",
      answer: "Pour commencer, créez un compte sur notre plateforme, complétez votre profil investisseur, et effectuez un premier dépôt. Vous pourrez ensuite parcourir les projets disponibles et sélectionner ceux qui correspondent à vos objectifs financiers."
    }
  ];

  const filteredFAQs = faqItems.filter(
    item => item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
           item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-bgs-blue text-center mb-2">Questions fréquentes</h1>
            <p className="text-bgs-blue/70 text-center mb-8">
              Tout ce que vous devez savoir sur l'investissement avec BGS Business Club
            </p>
            
            {/* Search bar */}
            <div className="mb-10 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-bgs-blue/50" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-3 focus:outline-none focus:ring-2 focus:ring-bgs-orange/50"
              />
            </div>
            
            {/* FAQ Accordion */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQs.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="bg-white/70 rounded-lg overflow-hidden border border-bgs-blue/10">
                      <AccordionTrigger className="px-4 py-3 text-left font-medium text-bgs-blue hover:text-bgs-orange transition-colors">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-1 text-bgs-blue/80">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-10">
                  <p className="text-bgs-blue/70 mb-2">Aucun résultat trouvé pour "{searchTerm}"</p>
                  <p className="text-bgs-blue/60 text-sm">Essayez un autre terme de recherche ou parcourez toutes les questions.</p>
                </div>
              )}
            </div>
            
            {/* Contact section */}
            <div className="mt-12 text-center">
              <h2 className="text-xl font-semibold text-bgs-blue mb-4">Vous n'avez pas trouvé de réponse à votre question ?</h2>
              <p className="text-bgs-blue/70 mb-6">
                Contactez-nous directement et nous vous répondrons dans les plus brefs délais.
              </p>
              <a href="mailto:contact@bgsbusiness.club" className="btn-primary inline-block">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
