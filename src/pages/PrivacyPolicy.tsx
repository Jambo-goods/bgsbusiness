
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-8 text-3xl font-bold text-bgs-blue">Politique de confidentialité</h1>
            
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
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">Introduction</h2>
                <p className="text-bgs-blue/80 mb-4">
                  BGS Business Club respecte votre vie privée et s'engage à protéger vos données personnelles. Cette politique de confidentialité vous informe sur la manière dont nous recueillons, utilisons et protégeons vos informations lorsque vous utilisez notre site web et nos services.
                </p>
                <p className="text-bgs-blue/80">
                  Veuillez lire attentivement cette politique de confidentialité pour comprendre nos pratiques concernant vos données personnelles et comment nous les traiterons.
                </p>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">Informations que nous collectons</h2>
                <p className="text-bgs-blue/80 mb-4">
                  Nous pouvons collecter les types d'informations suivants :
                </p>
                <ul className="list-disc pl-5 space-y-2 text-bgs-blue/80">
                  <li>Informations d'identification personnelle (nom, prénom, adresse e-mail, numéro de téléphone)</li>
                  <li>Informations financières (pour le traitement des investissements)</li>
                  <li>Informations de connexion et d'utilisation du site</li>
                  <li>Préférences et centres d'intérêt liés aux investissements</li>
                  <li>Communications et correspondances avec nos services</li>
                </ul>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">Comment nous utilisons vos informations</h2>
                <p className="text-bgs-blue/80 mb-4">
                  Nous utilisons vos informations pour les finalités suivantes :
                </p>
                <ul className="list-disc pl-5 space-y-2 text-bgs-blue/80">
                  <li>Fournir et gérer nos services d'investissement</li>
                  <li>Communiquer avec vous concernant vos investissements</li>
                  <li>Améliorer et personnaliser votre expérience utilisateur</li>
                  <li>Respecter nos obligations légales et réglementaires</li>
                  <li>Détecter et prévenir les activités frauduleuses</li>
                </ul>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">Partage de vos informations</h2>
                <p className="text-bgs-blue/80 mb-4">
                  Nous ne vendons pas vos données personnelles à des tiers. Nous pouvons partager vos informations avec :
                </p>
                <ul className="list-disc pl-5 space-y-2 text-bgs-blue/80">
                  <li>Nos partenaires et prestataires de services</li>
                  <li>Nos filiales et entités affiliées</li>
                  <li>Les autorités légales lorsque requis par la loi</li>
                </ul>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">Sécurité des données</h2>
                <p className="text-bgs-blue/80">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre la perte, l'accès non autorisé, la divulgation, l'altération et la destruction.
                </p>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">Vos droits</h2>
                <p className="text-bgs-blue/80 mb-4">
                  Conformément aux lois applicables sur la protection des données, vous disposez des droits suivants :
                </p>
                <ul className="list-disc pl-5 space-y-2 text-bgs-blue/80">
                  <li>Droit d'accès à vos données personnelles</li>
                  <li>Droit de rectification des informations inexactes</li>
                  <li>Droit d'effacement (droit à l'oubli)</li>
                  <li>Droit à la limitation du traitement</li>
                  <li>Droit à la portabilité des données</li>
                  <li>Droit d'opposition au traitement</li>
                </ul>
              </section>
              
              <section className="py-6">
                <h2 className="text-xl font-semibold text-bgs-blue mb-4">Contact</h2>
                <p className="text-bgs-blue/80">
                  Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, veuillez nous contacter à l'adresse email suivante : privacy@bgsbusiness.club
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
