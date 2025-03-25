
import React from "react";
import { CircleCheck } from "lucide-react";

export default function BusinessModel() {
  return (
    <section className="py-20 bg-bgs-gray-light relative overflow-hidden">
      <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-bgs-blue/5 blur-3xl" />
      <div className="absolute -bottom-[30%] -left-[10%] w-[600px] h-[600px] rounded-full bg-bgs-orange/5 blur-3xl" />
      
      <div className="container px-4 md:px-6 mx-auto relative">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl animate-fade-up">
            <span className="text-gradient">Notre modèle économique</span>
          </h2>
          <p className="text-xl text-bgs-blue/80 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Comprendre comment votre investissement génère des rendements
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="glass-card p-8 animate-fade-up bg-white border border-gray-100 rounded-xl shadow-sm" style={{ animationDelay: "0.2s" }}>
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
            <div className="glass-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
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
            
            <div className="glass-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
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
  );
}
