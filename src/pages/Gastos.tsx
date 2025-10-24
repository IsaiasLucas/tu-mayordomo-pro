import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useProfile } from "@/hooks/useProfile";
import GastosView from "@/components/views/GastosView";
import CardConfigWhatsApp from "@/components/CardConfigWhatsApp";
import { Skeleton } from "@/components/ui/skeleton";

export default function Gastos() {
  const navigate = useNavigate();
  const { isHydrating, isAuthenticated } = useAuthGuard();
  const { profile, loading, needsWhatsAppConfig } = useProfile();

  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isHydrating, isAuthenticated, navigate]);

  if (isHydrating) {
    return null;
  }

  if (loading) {
    return (
      <main className="screen px-6 py-6 space-y-6" style={{ minHeight: '100dvh', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </main>
    );
  }

  if (needsWhatsAppConfig) {
    return (
      <main className="screen px-6 py-6 space-y-6" style={{ minHeight: '100dvh', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <CardConfigWhatsApp />
      </main>
    );
  }

  return <GastosView profile={profile} />;
}
