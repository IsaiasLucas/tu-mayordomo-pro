import React, { useState } from "react";
import { postJSON, getTel } from "@/lib/api";
import { useReportes } from "@/hooks/useReportes";

export default function ReportesView() {
  const { items, loading } = useReportes();
  const [busy,setBusy] = useState(false);

  const generar = async (tipo:"semanal"|"mensual")=>{
    setBusy(true);
    await postJSON(`/pdf?tel=${getTel()}&tipo=${tipo}`);
    window.location.reload();
  };

  return (
    <main className="p-4 space-y-4">
      <div className="flex gap-3">
        <button disabled={busy} onClick={()=>generar("semanal")}
                className="bg-black text-white px-4 py-2 rounded-xl">PDF semanal</button>
        <button disabled={busy} onClick={()=>generar("mensual")}
                className="bg-black text-white px-4 py-2 rounded-xl">PDF mensual</button>
      </div>

      {loading ? "Cargando…" : (
        <div className="space-y-3">
          {items.map((r:any)=>(
            <div key={r.id} className="bg-white rounded-[24px] p-4 shadow flex justify-between items-center">
              <div>
                <div className="font-medium">{r.periodo} · {r.tipo}</div>
                <div className="text-xs text-gray-500">{r.creado_en}</div>
              </div>
              <a className="underline" href={r.pdf_url} target="_blank">Abrir PDF</a>
            </div>
          ))}
          {!items.length && <div className="text-gray-500">Sin reportes.</div>}
        </div>
      )}
    </main>
  );
}