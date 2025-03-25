
import { ReactNode } from "react";

interface InfoStepProps {
  title: string;
  description: string;
  icon: ReactNode;
  number?: number; // Make number optional since we'll set it based on the array index
}

export function InfoStep({ number, title, description, icon }: InfoStepProps) {
  return (
    <div className="glass-card p-6 relative">
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-bgs-blue text-white flex items-center justify-center text-xl font-bold shadow-lg">
        {number}
      </div>
      <div className="ml-4 mb-4 text-bgs-orange">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-bgs-blue/80">{description}</p>
    </div>
  );
}

interface InfoSectionProps {
  title: string;
  subtitle: string;
  steps: Omit<InfoStepProps, 'number'>[]; // Remove number requirement from the steps array
}

export default function InfoSection({ title, subtitle, steps }: InfoSectionProps) {
  return (
    <section className="py-20 relative overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-bgs-blue/5 blur-3xl" />
      <div className="absolute -bottom-[30%] -left-[10%] w-[600px] h-[600px] rounded-full bg-bgs-orange/5 blur-3xl" />

      <div className="container px-4 md:px-6 mx-auto relative">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl animate-fade-up">
            <span className="text-gradient">{title}</span>
          </h2>
          <p className="text-xl text-bgs-blue/80 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="animate-fade-up"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <InfoStep {...step} number={index + 1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
