import React from "react";
import { useGastos } from "@/hooks/useGastos";
import { fmtCLP } from "@/lib/api";

export default function GastosView() {
  const { items, loading } = useGastos();
  if (loading) return <div className="p-4">Cargando…</div>;

  return (
    <main className="p-4 space-y-3">
      {items.map((g:any)=>(
        <div key={g.id} className="flex justify-between items-center bg-white rounded-[24px] p-4 shadow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100" />
            <div>
              <div className="font-medium">{g.categoria}</div>
              <div className="text-xs text-gray-500">
                {new Date(g.fecha).toLocaleDateString("es-CL")}
              </div>
            </div>
          </div>
          <div className="font-semibold">{fmtCLP(Number(g.valor||0))}</div>
        </div>
      ))}
      {!items.length && <div className="text-gray-500">Sin gastos este mes.</div>}
    </main>
  );
}