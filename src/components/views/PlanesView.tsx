import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function PlanesView(){
  const { toast } = useToast();
  
  const go = (plan:"pro"|"premium")=>{
    toast({
      title: "Plano selecionado",
      description: `Você selecionou o plano ${plan.toUpperCase()}. A integração de pagamento será configurada em breve.`,
    });
  };
  
  return (
    <main className="p-4 grid gap-3">
      <div className="bg-muted text-muted-foreground px-4 py-3 rounded-2xl text-center font-medium">
        Plano Gratis · Sempre disponível
      </div>
      <Button onClick={()=>go("pro")} size="lg" className="rounded-2xl">
        PRO · CLP 4.990/mês
      </Button>
      <Button onClick={()=>go("premium")} size="lg" className="rounded-2xl">
        Premium · CLP 9.990/mês
      </Button>
    </main>
  );
}