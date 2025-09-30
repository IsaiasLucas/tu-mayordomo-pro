import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, GraduationCap, CheckCircle2 } from "lucide-react";

interface StudentVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}

export const StudentVerificationDialog = ({
  open,
  onOpenChange,
  onVerified,
}: StudentVerificationDialogProps) => {
  const [studentEmail, setStudentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!studentEmail || !studentEmail.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("verify-student-email", {
        body: { studentEmail },
      });

      if (error) throw error;

      if (data.valid) {
        toast({
          title: "✅ Email Verificado!",
          description: data.message,
        });
        onVerified();
        onOpenChange(false);
      } else {
        toast({
          title: "Verificação Falhou",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erro ao verificar email:", error);
      toast({
        title: "Erro na Verificação",
        description: error.message || "Não foi possível verificar o email. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 p-2 rounded-full">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle>Verificação de Estudante</DialogTitle>
          </div>
          <DialogDescription>
            Para ativar o plano estudante, insira seu email institucional (.edu, .ac.uk, etc.)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="student-email">Email Institucional</Label>
            <Input
              id="student-email"
              type="email"
              placeholder="seu.nome@universidad.edu"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
            <div className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Emails aceitos:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Domínios .edu (exemplo@uni.edu)</li>
                  <li>• Domínios .ac (exemplo@uni.ac.uk)</li>
                  <li>• Email estudante/alumnos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleVerify} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar Email"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};