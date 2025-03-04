
import React from "react";

export default function ProjectsHero() {
  return (
    <section className="container px-4 md:px-6 mx-auto">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="mb-4 animate-fade-up">
          <span className="text-bgs-blue">Projets</span>{" "}
          <span className="text-gradient">d'investissement</span>
        </h1>
        <p className="text-xl text-bgs-blue/80 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Découvrez nos opportunités d'investissement dans des actifs physiques en Afrique
        </p>
      </div>
    </section>
  );
}
