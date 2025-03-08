import React from "react";
import { HandCoins, TrendingUp, Clock, Globe } from "lucide-react";
export default function ProjectsHero() {
  return <section className="container px-4 md:px-6 mx-auto mb-16">
      <div className="text-center max-w-4xl mx-auto mb-12 animate-fade-up">
        <h1 className="mb-4">
          <span className="text-bgs-blue">Nos</span>{" "}
          <span className="text-gradient">opportunités</span>
        </h1>
        <p className="text-xl text-bgs-blue/80 max-w-3xl mx-auto">
          Diversifiez votre portefeuille avec des investissements dans des actifs 
          physiques en Afrique générant des rendements prévisibles.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-up" style={{
      animationDelay: "0.2s"
    }}>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50 hover:shadow-md transition-all">
          <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
            <HandCoins className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-bgs-blue mb-2">
            Rendements attractifs
          </h3>
          <p className="text-bgs-blue/70">
            Des rendements annuels de 10% à 15% distribués mensuellement.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50 hover:shadow-md transition-all">
          <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-bgs-blue mb-2">
            Actifs physiques
          </h3>
          <p className="text-bgs-blue/70">
            Investissez dans des équipements industriels tangibles et rentables.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50 hover:shadow-md transition-all">
          <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-bgs-blue mb-2">
            Flexibilité
          </h3>
          <p className="text-bgs-blue/70">
            Retirez votre investissement après seulement 6 mois d'engagement.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50 hover:shadow-md transition-all">
          <div className="bg-orange-100 p-3 rounded-lg w-fit mb-4">
            <Globe className="h-6 w-6 text-bgs-orange" />
          </div>
          <h3 className="text-lg font-semibold text-bgs-blue mb-2">
            Impact positif
          </h3>
          <p className="text-bgs-blue/70">
            Contribuez au développement économique des communautés locales.
          </p>
        </div>
      </div>
    </section>;
}