import React, { useState, useEffect } from "react";

interface HeroOverviewProps {
  total: number;
  varPct: number;
  title: string;
}

const HeroOverview = ({ total, varPct, title }: HeroOverviewProps) => {
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("tm_show_balance");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("tm_show_balance");
      setShowBalance(saved === null ? true : saved === "true");
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-[24px] p-7 shadow-lg">
      <h2 className="text-xl font-medium mb-3">{title}</h2>
      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-bold">
          {showBalance ? formatCLP(total) : "••••••"}
        </span>
        <span className={`text-base px-3 py-1.5 rounded-full font-medium ${
          varPct >= 0 
            ? "bg-green-500/30 text-green-100" 
            : "bg-red-500/30 text-red-100"
        }`}>
          {varPct > 0 ? '+' : ''}{varPct}%
        </span>
      </div>
      <p className="text-sm text-white/70 mt-3">
        Variación diaria vs ayer
      </p>
    </div>
  );
};

export default HeroOverview;