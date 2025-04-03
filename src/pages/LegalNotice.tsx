
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function LegalNotice() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Mentions Légales | BGS Business</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-bgs-blue mb-8">Mentions Légales</h1>
        
        <div className="prose prose-lg max-w-none text-bgs-blue/80">
          <p className="text-lg mb-6">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Informations sur l'entreprise</h2>
          <p>
            <strong>Raison sociale :</strong> BGS Business SAS<br />
            <strong>Forme juridique :</strong> Société par Actions Simplifiée<br />
            <strong>Capital social :</strong> 100 000 €<br />
            <strong>Numéro d'immatriculation :</strong> RCS Paris B 123 456 789<br />
            <strong>Numéro de TVA intracommunautaire :</strong> FR 12 123456789<br />
            <strong>Siège social :</strong> 123 Rue de l'Investissement, 75000 Paris, France<br />
            <strong>Téléphone :</strong> +33 1 23 45 67 89<br />
            <strong>Email :</strong> contact@bgsbusiness.com
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Directeur de la publication</h2>
          <p>
            M. Jean Dupont, en qualité de Président de BGS Business SAS.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Hébergement</h2>
          <p>
            <strong>Prestataire d'hébergement :</strong> Hosting Services Ltd<br />
            <strong>Siège social :</strong> 456 Server Avenue, 1000 Bruxelles, Belgique<br />
            <strong>Téléphone :</strong> +32 2 123 45 67<br />
            <strong>Email :</strong> contact@hostingservices.com
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Propriété intellectuelle</h2>
          <p>
            L'ensemble du contenu du site BGS Business, incluant, de façon non exhaustive, les graphismes, images, textes, vidéos, animations, sons, logos, gifs et icônes ainsi que leur mise en forme sont la propriété exclusive de BGS Business SAS à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.
          </p>
          <p>
            Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces différents éléments est strictement interdite sans l'accord exprès par écrit de BGS Business SAS. Cette représentation ou reproduction, par quelque procédé que ce soit, constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Crédits photographiques</h2>
          <p>
            Les photographies et visuels utilisés sur le site BGS Business sont issus de banques d'images libres de droits, de photographes professionnels avec lesquels BGS Business SAS a conclu un contrat, ou des visuels propriétaires de BGS Business SAS.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Liens hypertextes</h2>
          <p>
            Le site BGS Business peut contenir des liens hypertextes vers d'autres sites internet. BGS Business SAS ne peut être tenu responsable du contenu de ces sites et de l'usage qui pourrait en être fait par les utilisateurs.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Litiges et juridiction compétente</h2>
          <p>
            Les présentes mentions légales sont régies par la loi française. En cas de litige, les tribunaux français seront seuls compétents.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Médiation de la consommation</h2>
          <p>
            Conformément aux dispositions du Code de la consommation concernant le règlement amiable des litiges, BGS Business SAS adhère au Service du Médiateur de la consommation. Vous pouvez recourir gratuitement à ce service de médiation pour les litiges de consommation liés à l'utilisation de notre plateforme.
          </p>
          <p>
            <strong>Médiateur :</strong> Médiateur de la Consommation<br />
            <strong>Adresse :</strong> 789 Avenue de la Médiation, 75000 Paris<br />
            <strong>Site :</strong> www.mediateur-consommation.fr
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Données personnelles</h2>
          <p>
            Pour en savoir plus sur la façon dont nous traitons vos données personnelles, veuillez consulter notre <a href="/politique-de-confidentialite" className="text-bgs-orange">Politique de confidentialité</a>.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
