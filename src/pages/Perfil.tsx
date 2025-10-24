import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PerfilView from "@/components/views/PerfilView";

export default function Perfil() {
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

  return <PerfilView />;
}
