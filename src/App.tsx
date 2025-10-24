import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Gastos from "./pages/Gastos";
import Reportes from "./pages/Reportes";
import Planes from "./pages/Planes";
import Perfil from "./pages/Perfil";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./providers/AuthProvider";
import Navigation from "./components/Navigation";
import { useAuth } from "./providers/AuthProvider";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const isPro = profile?.plan === "pro" || profile?.plan === "mensal" || profile?.plan === "anual";
  
  return (
    <div className="w-full" style={{ minHeight: '100dvh', background: '#FFFFFF', position: 'relative', margin: 0, padding: 0 }}>
      <Navigation isPro={isPro} />
      <main style={{ 
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 7rem)',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
        position: 'relative', 
        minHeight: '100dvh',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        width: '100%',
        margin: 0
      }}>
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<AppLayout><Inicio /></AppLayout>} />
          <Route path="/gastos" element={<AppLayout><Gastos /></AppLayout>} />
          <Route path="/reportes" element={<AppLayout><Reportes /></AppLayout>} />
          <Route path="/planes" element={<AppLayout><Planes /></AppLayout>} />
          <Route path="/perfil" element={<AppLayout><Perfil /></AppLayout>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/reset" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;