import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

interface CompleteProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CompleteProfileModal({ open, onClose }: CompleteProfileModalProps) {
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Remove leading 56 if present
    let phone = digits;
    if (phone.startsWith("56")) {
      phone = phone.substring(2);
    }
    
    // Format as +56 9 1234 5678
    if (phone.length <= 1) return phone;
    if (phone.length <= 5) return `+56 ${phone}`;
    return `+56 ${phone.substring(0, 1)} ${phone.substring(1, 5)} ${phone.substring(5, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setWhatsapp(formatted);
  };

  const handleSave = async () => {
    // Validación
    if (!nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      });
      return;
    }

    if (!whatsapp.trim()) {
      toast({
        title: "Error",
        description: "El WhatsApp es requerido",
        variant: "destructive",
      });
      return;
    }

    if (!tipo) {
      toast({
        title: "Error",
        description: "Debes seleccionar un tipo de cuenta",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyCWcSuxX5X3U3NXFj2MKkA9e_Kk4wHtofRw1mKLI_6_HYHN4siyRRKbXAjdkNULkS1rQ/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "addUser",
            name: nombre,
            phone: whatsapp,
            kind: tipo === "Empresa" ? "empresa" : "pessoal",
          }),
        }
      );

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Falha ao salvar");
      }

      // Guardar phone formatado en localStorage
      localStorage.setItem("tm_phone", whatsapp);
      
      toast({
        title: "✅ Número verificado",
        description: "Tu cuenta está activa.",
      });

      onClose();
    } catch (error) {
      console.error("Error al guardar datos:", error);
      toast({
        title: "❌ Error",
        description: "No fue posible guardar tus datos. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              Completa tus datos para activar Tu Mayordomo
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              placeholder="Tu nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+56 9 1234 5678"
              value={whatsapp}
              onChange={handlePhoneChange}
              disabled={loading}
              maxLength={17}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de cuenta *</Label>
            <Select value={tipo} onValueChange={setTipo} disabled={loading}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Empresa">Empresa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
