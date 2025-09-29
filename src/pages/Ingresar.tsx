import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setTel } from "@/lib/api";

export default function Ingresar() {
  const [v, setV] = useState("");
  const navigate = useNavigate();

  const go = () => {
    if (!v.trim()) return;
    setTel(v);          // normaliza para 56 + dígitos
    navigate("/inicio");
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Ingresar</h1>
      <p>Escribe tu número (solo dígitos, Chile 56...)</p>
      <input
        className="w-full border rounded-xl p-3"
        placeholder="56999999999"
        value={v}
        onChange={(e) => setV(e.target.value)}
      />
      <button onClick={go} className="bg-purple-600 text-white px-4 py-3 rounded-xl w-full">
        Entrar
      </button>
      
      <div className="pt-4 border-t">
        <p className="text-sm text-gray-600 mb-3">¿Prefieres crear una cuenta completa?</p>
        <button 
          onClick={() => navigate("/auth")} 
          className="bg-gray-800 text-white px-4 py-3 rounded-xl w-full"
        >
          Crear cuenta con email
        </button>
      </div>
    </main>
  );
}