import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CardConfigWhatsApp() {
  const navigate = useNavigate();

  return (
    <Card className="shadow-card rounded-2xl border-2 border-primary animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Phone className="w-6 h-6" />
          Configura tu WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base text-muted-foreground">
          Para comenzar a usar Tu Mayordomo, necesitas configurar tu número de WhatsApp
        </p>
        <Button 
          onClick={() => navigate('/perfil')}
          className="w-full h-12 text-base"
        >
          Completar Perfil
        </Button>
      </CardContent>
    </Card>
  );
}
