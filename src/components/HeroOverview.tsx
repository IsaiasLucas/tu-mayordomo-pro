import React from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

type Props = { 
  total?: number; 
  varPct?: number; 
  title?: string;
};

export default function HeroOverview({
  total = 15571.5,
  varPct = 16,
  title = "Overview",
}: Props) {
  const clp = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(total);

  return (
    <div className="bg-gradient-header text-primary-foreground shadow-card-hover rounded-3xl p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-lg font-semibold opacity-90">{title}</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl px-4"
        >
          Show less
        </Button>
      </div>

      <div className="flex items-baseline space-x-3 mb-2">
        <span className="text-4xl font-bold">{clp}</span>
        <div className="flex items-center space-x-1 bg-success/20 text-success-foreground px-3 py-1 rounded-full">
          <TrendingUp className="h-3 w-3" />
          <span className="text-sm font-semibold">{varPct.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}