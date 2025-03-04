
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsList from "@/components/projects/ProjectsList";
import { projects } from "@/data/projects";

export default function Projects() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-32 pb-20">
        {/* Hero section */}
        <ProjectsHero />
        
        {/* Projects list */}
        <section className="container px-4 md:px-6 mx-auto">
          <ProjectsList projects={projects} />
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
