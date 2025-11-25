import React, { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency, type CurrencyCode } from "@/lib/countries";

interface HeroOverviewProps {
  total: number;
  varPct: number;
  title: string;
}

const HeroOverview = ({ total, varPct, title }: HeroOverviewProps) => {
  const { profile } = useProfile();
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

  const formatAmount = (amount: number) => {
    const currency = (profile?.currency as CurrencyCode) || 'CLP';
    const country = profile?.country || 'CL';
    const countryLocale = country === 'US' ? 'en-US' : 'es-' + country;
    return formatCurrency(amount, currency, countryLocale);
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-2xl sm:rounded-[24px] p-5 sm:p-7 shadow-lg">
      <h2 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3">{title}</h2>
      <span className="text-3xl sm:text-4xl font-bold">
        {showBalance ? formatAmount(total) : "••••••"}
      </span>
    </div>
  );
};

export default HeroOverview;