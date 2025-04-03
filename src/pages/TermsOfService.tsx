
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Conditions d'Utilisation | BGS Invest</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-bgs-blue mb-8">Conditions d'Utilisation</h1>
        
        <div className="prose prose-lg max-w-none text-bgs-blue/80">
          <p className="text-lg mb-6">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptation des conditions</h2>
          <p>
            En accédant à la plateforme BGS Invest, vous acceptez d'être lié par ces conditions d'utilisation, toutes les lois et réglementations applicables, et vous acceptez que vous êtes responsable du respect des lois locales applicables. Si vous n'acceptez pas ces conditions, vous n'êtes pas autorisé à utiliser cette plateforme.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description du service</h2>
          <p>
            BGS Invest est une plateforme qui permet aux utilisateurs d'investir dans des actifs physiques en Afrique et de percevoir une part des bénéfices générés. Notre service facilite l'achat de machines et d'équipements qui sont ensuite loués à des entreprises africaines.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Conditions d'inscription</h2>
          <p>
            Pour utiliser notre plateforme, vous devez :
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>Être âgé d'au moins 18 ans</li>
            <li>Fournir des informations exactes, complètes et à jour lors de l'inscription</li>
            <li>Maintenir la confidentialité de votre mot de passe et de votre compte</li>
            <li>Accepter la responsabilité de toutes les activités qui se produisent sous votre compte</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Risques d'investissement</h2>
          <p>
            Tout investissement comporte des risques. Avant d'investir, assurez-vous de comprendre :
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>Que le capital n'est pas garanti</li>
            <li>Que les rendements passés ne préjugent pas des performances futures</li>
            <li>Les risques spécifiques liés aux investissements en Afrique (politiques, économiques, etc.)</li>
            <li>L'importance de diversifier vos investissements</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Transactions et paiements</h2>
          <p>
            En effectuant un investissement sur notre plateforme :
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>Vous garantissez que vous êtes légalement autorisé à utiliser les méthodes de paiement associées à votre compte</li>
            <li>Vous acceptez de payer les montants indiqués pour les investissements que vous choisissez</li>
            <li>Vous comprenez les conditions spécifiques de chaque projet d'investissement</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Propriété intellectuelle</h2>
          <p>
            Tout le contenu présent sur la plateforme BGS Invest, y compris les textes, graphiques, logos, images, ainsi que leur compilation, sont la propriété de BGS Invest ou de ses fournisseurs de contenu et sont protégés par les lois sur les droits d'auteur.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation de responsabilité</h2>
          <p>
            BGS Invest ne sera pas responsable des dommages directs, indirects, accessoires, spéciaux ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser nos services, ou pour toute autre réclamation liée d'une quelconque manière à votre utilisation des services.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Modification des conditions</h2>
          <p>
            BGS Invest se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des modifications substantielles par e-mail ou par une notification sur la plateforme.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Loi applicable</h2>
          <p>
            Ces conditions sont régies par les lois françaises. Tout litige relatif à l'utilisation de la plateforme sera soumis à la compétence exclusive des tribunaux français.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact</h2>
          <p>
            Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à l'adresse suivante : <a href="mailto:legal@bgsinvest.com" className="text-bgs-orange">legal@bgsinvest.com</a>
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
