import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import ReportesView from "@/components/views/ReportesView";

export default function Reportes() {
  const navigate = useNavigate();
  const { isHydrating, isAuthenticated } = useAuthGuard();

  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isHydrating, isAuthenticated, navigate]);

  if (isHydrating) {
    return null;
  }

  return <ReportesView />;
}
