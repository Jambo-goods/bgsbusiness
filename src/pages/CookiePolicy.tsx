
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CookiePolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Politique de Cookies | BGS Invest</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-bgs-blue mb-8">Politique de Cookies</h1>
        
        <div className="prose prose-lg max-w-none text-bgs-blue/80">
          <p className="text-lg mb-6">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Qu'est-ce qu'un cookie ?</h2>
          <p>
            Un cookie est un petit fichier texte qui est stocké sur votre ordinateur ou appareil mobile lorsque vous visitez un site web. Les cookies sont largement utilisés pour faire fonctionner les sites web ou les rendre plus efficaces, ainsi que pour fournir des informations aux propriétaires du site.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Comment nous utilisons les cookies</h2>
          <p>
            BGS Invest utilise des cookies pour les finalités suivantes :
          </p>
          <ul className="list-disc pl-6 my-4">
            <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement de notre plateforme, ils vous permettent de vous connecter à votre compte et d'utiliser nos services.</li>
            <li><strong>Cookies de fonctionnalité :</strong> Nous permettent de mémoriser vos préférences et de personnaliser votre expérience.</li>
            <li><strong>Cookies analytiques :</strong> Nous aident à comprendre comment les visiteurs interagissent avec notre plateforme, ce qui nous permet d'améliorer continuellement nos services.</li>
            <li><strong>Cookies de marketing :</strong> Utilisés pour suivre les visiteurs sur les sites web afin de présenter des publicités pertinentes basées sur les pages visitées.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Types de cookies que nous utilisons</h2>
          <h3 className="text-xl font-medium mt-6 mb-3">3.1 Cookies de session</h3>
          <p>
            Ces cookies sont temporaires et expirent une fois que vous fermez votre navigateur. Ils sont utilisés pour maintenir votre session pendant que vous naviguez sur notre plateforme.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">3.2 Cookies persistants</h3>
          <p>
            Ces cookies restent sur votre appareil pendant une période définie ou jusqu'à ce que vous les supprimiez. Ils nous permettent de vous reconnaître lorsque vous revenez sur notre plateforme et nous aident à améliorer votre expérience.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">3.3 Cookies tiers</h3>
          <p>
            Certains cookies sont placés par des services tiers que nous utilisons, comme les outils d'analyse et les plateformes de réseaux sociaux. Ces cookies nous aident à comprendre comment vous utilisez notre plateforme et à améliorer nos services.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Contrôle des cookies</h2>
          <p>
            Vous pouvez contrôler et gérer les cookies de plusieurs façons :
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>Paramètres du navigateur : Vous pouvez modifier les paramètres de votre navigateur pour bloquer ou supprimer les cookies.</li>
            <li>Préférences de notre plateforme : Nous vous offrons la possibilité de gérer vos préférences en matière de cookies via notre bandeau de consentement.</li>
          </ul>
          <p>
            Veuillez noter que la désactivation de certains cookies peut affecter votre expérience sur notre plateforme et limiter certaines fonctionnalités.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Liste des cookies utilisés</h2>
          <table className="min-w-full bg-white border border-gray-300 my-6">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Nom</th>
                <th className="border border-gray-300 px-4 py-2">Objectif</th>
                <th className="border border-gray-300 px-4 py-2">Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">session</td>
                <td className="border border-gray-300 px-4 py-2">Authentification et session utilisateur</td>
                <td className="border border-gray-300 px-4 py-2">Session</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">preferences</td>
                <td className="border border-gray-300 px-4 py-2">Sauvegarde des préférences utilisateur</td>
                <td className="border border-gray-300 px-4 py-2">1 an</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">analytics</td>
                <td className="border border-gray-300 px-4 py-2">Analyse de l'utilisation du site</td>
                <td className="border border-gray-300 px-4 py-2">2 ans</td>
              </tr>
            </tbody>
          </table>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Mises à jour de notre politique de cookies</h2>
          <p>
            Nous pouvons mettre à jour cette politique de cookies de temps à autre pour refléter les changements dans nos pratiques ou pour d'autres raisons opérationnelles, légales ou réglementaires. Nous vous encourageons à consulter régulièrement cette page pour rester informé des dernières mises à jour.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact</h2>
          <p>
            Si vous avez des questions concernant notre utilisation des cookies, veuillez nous contacter à l'adresse suivante : <a href="mailto:privacy@bgsinvest.com" className="text-bgs-orange">privacy@bgsinvest.com</a>
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
