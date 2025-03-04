
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-8 text-3xl font-bold text-bgs-blue">Conditions d'utilisation</h1>
            
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 shadow-sm divide-y divide-bgs-blue/10">
              <section className="pb-6">
                <p className="text-bgs-blue/80">
                  Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">1. Acceptation des conditions</h2>
                <p className="text-bgs-blue/80">
                  En accédant et en utilisant le site web et les services de BGS Business Club, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site ou nos services.
                </p>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">2. Description des services</h2>
                <p className="text-bgs-blue/80 mb-4">
                  BGS Business Club propose une plateforme d'investissement permettant à ses membres d'investir dans des actifs physiques en Afrique. Nos services comprennent, sans s'y limiter :
                </p>
                <ul className="list-disc pl-5 space-y-2 text-bgs-blue/80">
                  <li>Présentation de projets d'investissement</li>
                  <li>Facilitation des investissements</li>
                  <li>Suivi des rendements et performances</li>
                  <li>Services d'information et de conseil</li>
                </ul>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">3. Conditions d'éligibilité</h2>
                <p className="text-bgs-blue/80 mb-4">
                  Pour utiliser nos services, vous devez :
                </p>
                <ul className="list-disc pl-5 space-y-2 text-bgs-blue/80">
                  <li>Être âgé d'au moins 18 ans</li>
                  <li>Avoir la capacité juridique de conclure des contrats</li>
                  <li>Fournir des informations exactes et complètes lors de l'inscription</li>
                  <li>Respecter les lois et réglementations applicables en matière d'investissement</li>
                </ul>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">4. Comptes utilisateurs</h2>
                <p className="text-bgs-blue/80 mb-4">
                  Vous êtes responsable du maintien de la confidentialité de vos informations de compte et de mot de passe. Vous acceptez de nous informer immédiatement de toute utilisation non autorisée de votre compte.
                </p>
                <p className="text-bgs-blue/80">
                  Nous nous réservons le droit de suspendre ou de résilier votre compte à notre discrétion si nous suspectons une utilisation abusive ou frauduleuse.
                </p>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">5. Investissements et risques</h2>
                <p className="text-bgs-blue/80 mb-4">
                  Tout investissement comporte des risques. Les performances passées ne préjugent pas des performances futures. Vous reconnaissez que :
                </p>
                <ul className="list-disc pl-5 space-y-2 text-bgs-blue/80">
                  <li>La valeur des investissements peut fluctuer</li>
                  <li>Le capital investi n'est pas garanti</li>
                  <li>Les rendements espérés sont des projections et non des garanties</li>
                  <li>Vous êtes seul responsable de vos décisions d'investissement</li>
                </ul>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">6. Propriété intellectuelle</h2>
                <p className="text-bgs-blue/80">
                  Tous les contenus présents sur notre site (textes, images, logos, vidéos, etc.) sont protégés par des droits de propriété intellectuelle. Aucun contenu ne peut être reproduit, modifié ou distribué sans notre autorisation écrite préalable.
                </p>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">7. Limitation de responsabilité</h2>
                <p className="text-bgs-blue/80">
                  Dans toute la mesure permise par la loi applicable, BGS Business Club ne pourra être tenu responsable des dommages directs, indirects, accessoires, spéciaux ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser nos services.
                </p>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">8. Modifications des conditions</h2>
                <p className="text-bgs-blue/80">
                  Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. Les modifications entreront en vigueur dès leur publication sur notre site. Nous vous encourageons à consulter régulièrement cette page pour prendre connaissance des mises à jour.
                </p>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">9. Loi applicable</h2>
                <p className="text-bgs-blue/80">
                  Ces conditions d'utilisation sont régies et interprétées conformément aux lois françaises. Tout litige relatif à ces conditions sera soumis à la compétence exclusive des tribunaux français.
                </p>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">10. Contact</h2>
                <p className="text-bgs-blue/80">
                  Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à l'adresse email suivante : legal@bgsbusiness.club
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
