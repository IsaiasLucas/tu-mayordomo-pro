import React, { useState } from "react";
import { postJSON } from "@/lib/api";

export default function PlanesView(){
  const [busy,setBusy] = useState(false);
  const go = async (plan:"mensual"|"anual"|"estudiante")=>{
    setBusy(true);
    const { url } = await postJSON("/stripe/checkout",{ plan });
    window.location.href = url;
  };
  return (
    <main className="p-4 grid gap-3">
      <button disabled={busy} onClick={()=>go("mensual")} className="bg-black text-white px-4 py-3 rounded-2xl">PRO Mensual · CLP 3.000</button>
      <button disabled={busy} onClick={()=>go("anual")} className="bg-black text-white px-4 py-3 rounded-2xl">PRO Anual · CLP 25.000</button>
      <button disabled={busy} onClick={()=>go("estudiante")} className="bg-black text-white px-4 py-3 rounded-2xl">Estudiantes · CLP 1.500</button>
    </main>
  );
}