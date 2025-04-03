
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Politique de Confidentialité | BGS Business</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-bgs-blue mb-8">Politique de Confidentialité</h1>
        
        <div className="prose prose-lg max-w-none text-bgs-blue/80">
          <p className="text-lg mb-6">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>
            BGS Business ("nous", "notre", "nos") s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations personnelles lorsque vous utilisez notre plateforme d'investissement.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Informations que nous collectons</h2>
          <p>Nous collectons les types d'informations suivants :</p>
          <ul className="list-disc pl-6 my-4">
            <li><strong>Informations d'identification :</strong> Nom, prénom, adresse e-mail, numéro de téléphone.</li>
            <li><strong>Informations financières :</strong> Coordonnées bancaires, historique des investissements, transactions.</li>
            <li><strong>Informations de navigation :</strong> Données de connexion, adresse IP, type d'appareil, pages visitées.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Utilisation des informations</h2>
          <p>Nous utilisons vos informations pour :</p>
          <ul className="list-disc pl-6 my-4">
            <li>Gérer votre compte et vous fournir nos services d'investissement</li>
            <li>Traiter vos transactions et vous tenir informé de l'état de vos investissements</li>
            <li>Vous envoyer des communications sur les opportunités d'investissement</li>
            <li>Respecter nos obligations légales et réglementaires</li>
            <li>Améliorer nos services et votre expérience utilisateur</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Partage des informations</h2>
          <p>
            Nous pouvons partager vos informations avec :
          </p>
          <ul className="list-disc pl-6 my-4">
            <li><strong>Partenaires commerciaux :</strong> Pour faciliter vos investissements dans des projets en Afrique.</li>
            <li><strong>Prestataires de services :</strong> Qui nous aident à exploiter notre plateforme (paiement, hébergement).</li>
            <li><strong>Autorités :</strong> Si la loi l'exige ou pour protéger nos droits légaux.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Sécurité des données</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos informations contre tout accès non autorisé, perte ou altération. Cependant, aucune méthode de transmission sur Internet n'est totalement sécurisée.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Vos droits</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>Droit d'accès à vos données personnelles</li>
            <li>Droit de rectification des données inexactes</li>
            <li>Droit à l'effacement (droit à l'oubli)</li>
            <li>Droit à la limitation du traitement</li>
            <li>Droit à la portabilité des données</li>
            <li>Droit d'opposition au traitement</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, veuillez nous contacter à l'adresse suivante : <a href="mailto:privacy@bgsbusiness.com" className="text-bgs-orange">privacy@bgsbusiness.com</a>
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
