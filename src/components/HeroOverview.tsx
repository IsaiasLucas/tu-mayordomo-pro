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
    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-2xl sm:rounded-[24px] p-5 sm:p-7 shadow-lg">
      <h2 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3">{title}</h2>
      <span className="text-3xl sm:text-4xl font-bold">
        {showBalance ? formatCLP(total) : "••••••"}
      </span>
    </div>
  );
};

export default HeroOverview;