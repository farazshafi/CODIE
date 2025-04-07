
import React, { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="group relative p-8 rounded-xl backdrop-blur-sm transition-all duration-300 hover:translate-y-[-5px]">
      {/* Gradient background with animation */}
      <div className="absolute inset-0 bg-primary rounded-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white-500/50 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="mb-5 p-3 rounded-lg bg-black/50 w-fit">{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;