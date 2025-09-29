import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setTel } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Ingresar() {
  const [v, setV] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const go = async () => {
    if (!v.trim()) return;
    
    setLoading(true);
    const telefoneNormalizado = setTel(v);
    
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyF1bpzDkaBqRmk_lshvclbyVcr0GGeQaAwU3KM_3rYLw7csxLO9rNLsl7pACrronj1/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: telefoneNormalizado,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao registrar telefone");
      }

      navigate("/inicio");
    } catch (error) {
      console.error("Erro ao enviar telefone:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o telefone. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
      <button 
        onClick={go} 
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-3 rounded-xl w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Registrando..." : "Entrar"}
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