
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface HeaderSectionProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export default function HeaderSection({
  title,
  subtitle,
  ctaText = "Découvrir les projets",
  ctaLink = "/projects",
  secondaryCtaText = "Comment ça marche",
  secondaryCtaLink = "/how-it-works",
}: HeaderSectionProps) {
  // Splitting the title into two parts for display on separate lines
  const titleWords = title.split(' ');
  const firstLine = titleWords.slice(0, Math.ceil(titleWords.length / 2)).join(' ');
  const secondLine = titleWords.slice(Math.ceil(titleWords.length / 2)).join(' ');

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `url('/lovable-uploads/57d247ea-a3b9-4faa-8ef7-96755645a44e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Background Elements */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-bgs-blue-light/5 to-transparent" />
      <div className="absolute -top-[30%] -right-[10%] w-[600px] h-[600px] rounded-full bg-bgs-orange/5 blur-3xl" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-bgs-blue/5 blur-3xl" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 mb-6 text-sm font-medium rounded-full bg-bgs-orange/10 text-bgs-orange animate-fade-in">
            BGS Business Club
          </span>
          
          <h1 className="mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="block font-bold text-bgs-blue">
              {firstLine}
            </span>
            <span className="block font-bold text-gradient">
              {secondLine}
            </span>
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-bgs-blue/80 mb-10 max-w-3xl mx-auto animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            {subtitle}
          </p>
          
          <div 
            className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link 
              to={ctaLink} 
              className="btn-primary group flex items-center justify-center gap-2"
            >
              {ctaText}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              to={secondaryCtaLink} 
              className="btn-secondary"
            >
              {secondaryCtaText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
