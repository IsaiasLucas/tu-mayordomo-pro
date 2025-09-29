import React from "react";
import HeroOverview from "../HeroOverview";
import { useAuth } from "@/hooks/useAuth";
import { useGastos } from "@/hooks/useGastos";
import { fmtCLP } from "@/lib/api";

const InicioView = () => {
  const { profile, loading } = useAuth();
  const { items: gastos } = useGastos();

  const ingresos = gastos.filter(g=>String(g.tipo).toLowerCase()==="ingreso")
                         .reduce((s,g)=>s+Number(g.valor||0),0);
  const egresos  = gastos.filter(g=>String(g.tipo).toLowerCase()==="egreso")
                         .reduce((s,g)=>s+Number(g.valor||0),0);
  const saldoMes = ingresos - egresos;

  return (
    <main className="p-4 space-y-4">
      <HeroOverview total={saldoMes||0} varPct={16} title="Overview" />

      {!loading && profile?.plan === "free" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-xl p-3">
          Plano gratuito ativo. 
          <a href="/planes" className="underline ml-2">Fazer upgrade para PRO</a>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[24px] p-4 shadow">
          <div className="text-sm text-gray-500">Ingresos del mes</div>
          <div className="text-xl font-semibold">{fmtCLP(ingresos)}</div>
        </div>
        <div className="bg-white rounded-[24px] p-4 shadow">
          <div className="text-sm text-gray-500">Gastos del mes</div>
          <div className="text-xl font-semibold">{fmtCLP(egresos)}</div>
        </div>
      </div>
    </main>
  );
};

export default InicioView;