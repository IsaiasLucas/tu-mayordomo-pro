import React from "react";
import { useReportes } from "@/hooks/useReportes";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ReportesView() {
  const { items, loading } = useReportes();
  const { toast } = useToast();

  const generar = (tipo:"semanal"|"mensual")=>{
    toast({
      title: "Gerando relatório",
      description: `Relatório ${tipo} será gerado em breve. A funcionalidade de PDF será implementada.`,
    });
  };

  return (
    <main className="p-4 space-y-4">
      <div className="flex gap-3">
        <Button onClick={()=>generar("semanal")} className="rounded-xl">
          PDF semanal
        </Button>
        <Button onClick={()=>generar("mensual")} className="rounded-xl">
          PDF mensual
        </Button>
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