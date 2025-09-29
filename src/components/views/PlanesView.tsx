import React, { useState } from "react";
import { postJSON } from "@/lib/api";

export default function PlanesView(){
  const [busy,setBusy] = useState(false);
  const go = async (plan:"pro"|"premium")=>{
    setBusy(true);
    const { url } = await postJSON("/stripe/checkout",{ plan });
    window.location.href = url;
  };
  return (
    <main className="p-4 grid gap-3">
      <button className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl cursor-default">Gratis · CLP 0</button>
      <button disabled={busy} onClick={()=>go("pro")} className="bg-black text-white px-4 py-3 rounded-2xl">PRO · CLP 4.990/mes</button>
      <button disabled={busy} onClick={()=>go("premium")} className="bg-black text-white px-4 py-3 rounded-2xl">Premium · CLP 9.990/mes</button>
    </main>
  );
}