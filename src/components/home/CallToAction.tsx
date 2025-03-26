
import { Link } from "react-router-dom";

export default function CallToAction() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute -top-[30%] -left-[10%] w-[600px] h-[600px] rounded-full bg-bgs-orange/5 blur-3xl" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-bgs-blue/5 blur-3xl" />
      
      <div className="container px-4 md:px-6 mx-auto">
        <div className="glass-card p-8 md:p-12 max-w-5xl mx-auto text-center relative overflow-hidden animate-fade-up">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bgs-blue via-bgs-orange to-bgs-blue-light" />
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à commencer votre parcours d'investisseur ?
          </h2>
          <p className="text-xl text-bgs-blue/80 mb-8 max-w-3xl mx-auto">
            Créez votre compte gratuitement et découvrez comment investir dans des projets à fort potentiel en Afrique.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="btn-primary group">
              Créez votre compte
            </Link>
            <Link to="/how-it-works" className="btn-secondary">
              En savoir plus
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
