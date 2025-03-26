import { Link } from "react-router-dom";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  ArrowUp 
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Footer() {
  // We're keeping the state variable but removing the button that uses it
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <footer className="bg-gradient-to-r from-bgs-blue/95 to-bgs-blue text-white pt-12 pb-6 mt-auto relative">
      {/* Removed the scroll to top button */}
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white/90">À propos de BGS Invest</h3>
            <p className="text-sm text-white/80 mb-4">
              BGS Business Club vous permet d'investir dans des actifs physiques en Afrique et de percevoir une part des bénéfices générés.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/70 hover:text-white transition-colors">
                <Facebook size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-white/70 hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/70 hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white/90">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-white/70 hover:text-white transition-colors">Accueil</Link>
              </li>
              <li>
                <Link to="/projects" className="text-white/70 hover:text-white transition-colors">Projets</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-white/70 hover:text-white transition-colors">Comment ça marche</Link>
              </li>
              <li>
                <Link to="/about" className="text-white/70 hover:text-white transition-colors">À propos</Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white/90">Ressources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors">Centre d'aide</a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors">Blog</a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors">Mentions légales</a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white/90">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin size={16} className="mr-2 mt-0.5 text-bgs-orange flex-shrink-0" />
                <span className="text-white/70">123 Rue de l'Investissement, 75000 Paris, France</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-bgs-orange flex-shrink-0" />
                <span className="text-white/70">+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2 text-bgs-orange flex-shrink-0" />
                <a href="mailto:contact@bgsinvest.com" className="text-white/70 hover:text-white transition-colors">
                  contact@bgsinvest.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 mt-6 border-t border-white/10 text-center text-sm text-white/60">
          <p>© {new Date().getFullYear()} BGS Invest. Tous droits réservés.</p>
          <p className="mt-2">
            <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
            {" · "}
            <a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a>
            {" · "}
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
