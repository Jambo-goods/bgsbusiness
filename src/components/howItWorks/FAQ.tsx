
import React from "react";
import { Link } from "react-router-dom";

export default function FAQ() {
  const faqItems = [
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
  ];

  return (
    <section className="py-20 container px-4 md:px-6 mx-auto bg-white">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl animate-fade-up">
          <span className="text-gradient">Questions fréquentes</span>
        </h2>
        <p className="text-xl text-bgs-blue/80 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Tout ce que vous devez savoir sur l'investissement avec BGS Business Club
        </p>
      </div>
      
      <div className="space-y-6 max-w-3xl mx-auto">
        {faqItems.map((faq, index) => (
          <div 
            key={index} 
            className="glass-card p-6 animate-fade-up bg-white border border-gray-100 rounded-xl shadow-sm"
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
        <Link to="/contact" className="btn-primary bg-bgs-blue hover:bg-bgs-blue/90 text-white px-6 py-3 rounded-lg inline-block">
          Contactez-nous
        </Link>
      </div>
    </section>
  );
}
