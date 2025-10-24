import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Shield, MessageCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CompleteProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CompleteProfileModal({ open, onClose }: CompleteProfileModalProps) {
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);

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
    
    // Validate phone number (Chilean format: 9 digits)
    const digits = formatted.replace(/\D/g, "");
    const isValid = digits.length === 11 && digits.startsWith("56") && digits[2] === "9";
    setPhoneValid(formatted.length > 0 ? isValid : null);
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

    if (!whatsapp.trim() || phoneValid !== true) {
      toast({
        title: "Error",
        description: "Debes ingresar un número de WhatsApp válido chileno",
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Extract only digits for usuarios table
      const phoneDigits = whatsapp.replace(/\D/g, "");

      // Update usuarios table with telefono, nombre, tipo_cuenta, and profile_complete
      const { error: usuariosError } = await supabase
        .from('usuarios')
        .update({
          telefono: phoneDigits,
          nombre: nombre,
          tipo_cuenta: tipo.toLowerCase(),
          profile_complete: true
        })
        .eq('user_id', user.id);

      if (usuariosError) throw usuariosError;

      // Save to Supabase profile with phone_personal or phone_empresa based on tipo
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: nombre,
          phone_personal: tipo === "Personal" ? whatsapp : null,
          phone_empresa: tipo === "Empresa" ? whatsapp : null,
          entidad: tipo.toLowerCase(),
          whatsapp_configured: true,
          profile_complete: true
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "✅ Perfil completado",
        description: "Tu WhatsApp ha sido configurado correctamente.",
      });

      // Force page reload to update profile state
      window.location.reload();
      
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl leading-tight">
                Completa tu Perfil
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1 leading-tight">
                Configura tu cuenta para comenzar a gestionar tus gastos
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="nombre" className="text-sm sm:text-base">Nombre *</Label>
            <Input
              id="nombre"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
              className="h-11 sm:h-12 text-base"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
              Número de WhatsApp *
            </Label>
            <div className="relative">
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={whatsapp}
                onChange={handlePhoneChange}
                disabled={loading}
                maxLength={17}
                className={`h-11 sm:h-12 pr-10 sm:pr-12 text-base ${
                  phoneValid === true 
                    ? "border-green-500 focus-visible:ring-green-500" 
                    : phoneValid === false 
                    ? "border-red-500 focus-visible:ring-red-500" 
                    : ""
                }`}
              />
              {phoneValid === true && (
                <CheckCircle2 className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              )}
              {phoneValid === false && (
                <AlertCircle className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <MessageCircle className="w-3 h-3 flex-shrink-0" />
              Introduce tu número chileno (debe comenzar con 9)
            </p>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base">Tipo de cuenta *</Label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setTipo("Personal")}
                disabled={loading}
                className={`flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 relative touch-manipulation ${
                  tipo === "Personal" 
                    ? "border-primary bg-primary/10 shadow-md" 
                    : "border-border bg-card hover:border-primary/50 active:scale-95"
                }`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                  tipo === "Personal" ? "bg-primary/20" : "bg-muted"
                }`}>
                  <span className="text-xl sm:text-2xl">👤</span>
                </div>
                <span className={`text-xs sm:text-sm font-medium ${
                  tipo === "Personal" ? "text-primary" : "text-foreground"
                }`}>
                  Personal
                </span>
                {tipo === "Personal" && (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary absolute top-1.5 sm:top-2 right-1.5 sm:right-2" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setTipo("Empresa")}
                disabled={loading}
                className={`flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 relative touch-manipulation ${
                  tipo === "Empresa" 
                    ? "border-primary bg-primary/10 shadow-md" 
                    : "border-border bg-card hover:border-primary/50 active:scale-95"
                }`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                  tipo === "Empresa" ? "bg-primary/20" : "bg-muted"
                }`}>
                  <span className="text-xl sm:text-2xl">🏢</span>
                </div>
                <span className={`text-xs sm:text-sm font-medium ${
                  tipo === "Empresa" ? "text-primary" : "text-foreground"
                }`}>
                  Empresa
                </span>
                {tipo === "Empresa" && (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary absolute top-1.5 sm:top-2 right-1.5 sm:right-2" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={loading || phoneValid !== true || !nombre.trim() || !tipo}
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold touch-manipulation"
          >
            {loading ? "Guardando..." : "Completar Perfil"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
