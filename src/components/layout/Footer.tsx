
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-bgs-blue text-white py-12">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img
              src="lovable-uploads/d9a3204a-06aa-470d-8255-7f3bd0852557.png"
              alt="BGS Business Club"
              className="h-12 mb-4"
            />
            <p className="text-white/70 mb-4">
              BGS Business Club vous permet d'investir dans des actifs physiques en Afrique et de générer des rendements attractifs.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/70 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-white/70 hover:text-white transition-colors">
                  Projets
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-white/70 hover:text-white transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/70 hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Ressources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-white/70 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/70 hover:text-white transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/70 hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-white/70">
                Email: contact@bgsbusiness.club
              </li>
              <li className="text-white/70">
                Téléphone: +33 1 23 45 67 89
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-white/10 text-center text-white/50 text-sm">
          &copy; {new Date().getFullYear()} BGS Business Club. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
