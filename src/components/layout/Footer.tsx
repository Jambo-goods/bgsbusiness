
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, LinkedIn } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-bgs-blue text-white py-12">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="block mb-6">
              <img
                src="lovable-uploads/d9a3204a-06aa-470d-8255-7f3bd0852557.png"
                alt="BGS Business Club"
                className="h-14"
              />
            </Link>
            <p className="text-white/70 mb-4">
              BGS Business Club vous permet d'investir dans des actifs physiques en Afrique et de générer des rendements attractifs.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <LinkedIn size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-5 border-b border-white/10 pb-2">Liens rapides</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> Accueil
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-white/70 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> Projets
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-white/70 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/70 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> À propos
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/70 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-5 border-b border-white/10 pb-2">Légal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/politique-de-confidentialite" className="text-white/70 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/conditions-dutilisation" className="text-white/70 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/mentions-legales" className="text-white/70 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> Mentions légales
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-5 border-b border-white/10 pb-2">Contact</h4>
            <ul className="space-y-4">
              <li className="text-white/70 flex items-center">
                <Mail size={18} className="mr-3 text-bgs-orange" />
                <span>contact@bgsbusiness.club</span>
              </li>
              <li className="text-white/70 flex items-center">
                <Phone size={18} className="mr-3 text-bgs-orange" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="text-white/70 flex items-center">
                <MapPin size={18} className="mr-3 text-bgs-orange" />
                <span>Paris, France</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link to="/contact" className="bg-white/10 hover:bg-white/20 transition-colors text-white py-2 px-4 rounded-md inline-flex items-center">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-white/10 text-center text-white/50 text-sm flex flex-col md:flex-row justify-between items-center">
          <div>&copy; {currentYear} BGS Business Club. Tous droits réservés.</div>
          <div className="mt-4 md:mt-0">Conçu avec ❤️ pour les investisseurs</div>
        </div>
      </div>
    </footer>
  );
}
