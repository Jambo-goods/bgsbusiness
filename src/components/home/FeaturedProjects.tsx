
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CircleCheck, Star, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/project";
import { fetchProjectsFromDatabase } from "@/utils/projectUtils";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currencyUtils";

export default function FeaturedProjects() {
  const [visibleProjects, setVisibleProjects] = useState(3);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        setIsLoading(true);
        const dbProjects = await fetchProjectsFromDatabase();
        const featured = dbProjects.filter(project => project.featured);
        setFeaturedProjects(featured || []);
      } catch (error) {
        console.error("Error loading featured projects:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les projets à la une.",
          variant: "destructive"
        });
        setFeaturedProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeaturedProjects();
  }, [toast]);
  
  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-bgs-gray-light">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-bgs-blue mb-4">
              Projets à la une
            </h2>
            <p className="text-bgs-blue/70 max-w-2xl mx-auto">
              Chargement des projets...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bgs-blue"></div>
          </div>
        </div>
      </section>
    );
  }
  
  if (featuredProjects.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-bgs-gray-light">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-bgs-blue mb-4">
              Projets à la une
            </h2>
            <p className="text-bgs-blue/70 max-w-2xl mx-auto">
              Aucun projet à la une n'est disponible pour le moment.
            </p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-16 bg-gradient-to-b from-white to-bgs-gray-light">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-bgs-blue mb-4">
            Projets à la une
          </h2>
          <p className="text-bgs-blue/70 max-w-2xl mx-auto">
            Découvrez nos opportunités d'investissement sélectionnées avec soin pour vous offrir
            le meilleur rapport qualité-rendement avec un impact réel en Afrique.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.slice(0, visibleProjects).map((project) => (
            <Link to={`/project/${project.id}`} key={project.id} className="group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 hover:-translate-y-1">
              <div className="relative">
                <img 
                  src={project.image} 
                  alt={project.name}
                  className="w-full h-52 object-cover transition-transform group-hover:scale-105 duration-500"
                />
                <div className="absolute top-3 right-3 bg-bgs-orange text-white text-xs font-medium px-3 py-1 rounded-full flex items-center">
                  <Star size={12} className="mr-1" />
                  Populaire
                </div>
                
                {project.location && (
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-bgs-blue text-xs font-medium px-3 py-1 rounded-full flex items-center">
                    <MapPin size={12} className="mr-1" />
                    {project.location}
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-bgs-orange/10 text-bgs-orange">
                      {project.category}
                    </span>
                    <div className="text-xs text-green-600 font-medium flex items-center bg-green-50 px-2 py-1 rounded-full">
                      <CircleCheck size={12} className="mr-1" />
                      {project.yield}% mensuel
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-bgs-blue group-hover:text-bgs-orange transition-colors">
                    {project.name}
                  </h3>
                  
                  <p className="text-sm text-bgs-blue/70 line-clamp-2">
                    {project.description}
                  </p>
                </div>
                
                <div className="mb-4">
                  <Progress value={project.fundingProgress} className="h-1.5 bg-gray-100" />
                  <div className="flex justify-between mt-1.5 text-xs text-bgs-gray-medium">
                    <span>{project.fundingProgress}% financé</span>
                    <span>{project.daysLeft || "30"} jours restants</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-bgs-blue/60">Investissement min.</p>
                    <p className="text-base font-bold text-bgs-blue">
                      {formatCurrency(project.min_investment)}
                    </p>
                  </div>
                  <div className="flex items-center text-bgs-orange font-medium group-hover:translate-x-1 transition-transform">
                    <span className="mr-1">Voir détails</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {featuredProjects.length > visibleProjects && (
          <div className="text-center mt-10">
            <button
              onClick={() => setVisibleProjects(prev => prev + 3)}
              className="btn-secondary inline-flex items-center"
            >
              Voir plus de projets
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        )}
        
        <div className="text-center mt-10">
          <Link to="/projects" className="btn-primary inline-flex items-center">
            Voir tous les projets
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
