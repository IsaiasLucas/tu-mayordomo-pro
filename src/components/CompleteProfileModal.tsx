import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Shield, MessageCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, CURRENCIES, type CurrencyCode, formatPhoneNumber, validatePhoneNumber, getPhoneFormat } from "@/lib/countries";
import { detectUserCountry } from "@/lib/countryDetection";
import { CountrySelector } from "@/components/CountrySelector";

interface CompleteProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CompleteProfileModal({ open, onClose }: CompleteProfileModalProps) {
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tipo, setTipo] = useState("");
  const [country, setCountry] = useState("CL");
  const [currency, setCurrency] = useState<CurrencyCode>("CLP");
  const [loading, setLoading] = useState(false);
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);
  const [detectingCountry, setDetectingCountry] = useState(true);

  // Auto-detect country when modal opens
  useEffect(() => {
    if (open) {
      const autoDetectCountry = async () => {
        setDetectingCountry(true);
        try {
          const detectedCountry = await detectUserCountry();
          setCountry(detectedCountry);
          
          // Update currency based on detected country
          const selectedCountry = COUNTRIES.find(c => c.code === detectedCountry);
          if (selectedCountry) {
            setCurrency(selectedCountry.currency as CurrencyCode);
          }
        } catch (error) {
          console.error('[CompleteProfileModal] Error detecting country:', error);
        } finally {
          setDetectingCountry(false);
        }
      };

      autoDetectCountry();
    }
  }, [open]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value, country);
    setWhatsapp(formatted);
    
    // Validate phone number for selected country
    const isValid = validatePhoneNumber(formatted, country);
    setPhoneValid(formatted.length > 0 ? isValid : null);
  };

  const currentPhoneFormat = getPhoneFormat(country);

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
      const countryName = COUNTRIES.find(c => c.code === country)?.name || country;
      toast({
        title: "Error",
        description: `Debes ingresar un número de WhatsApp válido de ${countryName}`,
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

      // Update both tables in parallel
      const [usuariosResult, profileResult] = await Promise.all([
        supabase
          .from('usuarios')
          .update({
            telefono: phoneDigits,
            nombre: nombre,
            tipo_cuenta: tipo.toLowerCase(),
            profile_complete: true,
            country,
            currency
          })
          .eq('user_id', user.id),
        
        supabase
          .from('profiles')
          .update({
            display_name: nombre,
            phone_personal: tipo === "Personal" ? whatsapp : null,
            phone_empresa: tipo === "Empresa" ? whatsapp : null,
            entidad: tipo.toLowerCase(),
            whatsapp_configured: true,
            profile_complete: true,
            country,
            currency
          })
          .eq('user_id', user.id)
      ]);

      if (usuariosResult.error) throw usuariosResult.error;
      if (profileResult.error) throw profileResult.error;

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
                placeholder={currentPhoneFormat?.placeholder || "+56 9 1234 5678"}
                value={whatsapp}
                onChange={handlePhoneChange}
                disabled={loading}
                maxLength={25}
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
              {currentPhoneFormat?.mask || "Introduce tu número de WhatsApp"}
            </p>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="country" className="text-sm sm:text-base">
              País *
            </Label>
            <CountrySelector
              value={country}
              onValueChange={(value) => {
                setCountry(value);
                const selectedCountry = COUNTRIES.find(c => c.code === value);
                if (selectedCountry) {
                  setCurrency(selectedCountry.currency as CurrencyCode);
                }
                // Reset phone when country changes
                setWhatsapp("");
                setPhoneValid(null);
              }}
              disabled={loading}
              detectingCountry={detectingCountry}
            />
            {!detectingCountry && (
              <p className="text-xs text-muted-foreground">
                ✓ País detectado automaticamente. Puedes cambiarlo si es necesario.
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="currency" className="text-sm sm:text-base">Moeda *</Label>
            <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)}>
              <SelectTrigger id="currency" className="h-11 sm:h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CURRENCIES).map(([code, info]) => (
                  <SelectItem key={code} value={code}>
                    {info.name} ({info.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
