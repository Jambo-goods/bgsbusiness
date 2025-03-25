
import React from "react";

export default function HeroSection() {
  return (
    <section className="container px-4 md:px-6 mx-auto mb-20">
      <div className="max-w-4xl mx-auto text-center animate-fade-up">
        <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
          <span className="text-bgs-blue">Comment ça</span>{" "}
          <span className="text-gradient">marche</span>
        </h1>
        <p className="text-xl text-bgs-blue/80 max-w-3xl mx-auto">
          Découvrez comment BGS Business Club vous permet d'investir facilement dans des actifs physiques en Afrique et de générer des rendements attractifs.
        </p>
      </div>
    </section>
  );
}
