import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import EmailConfirm from "./pages/EmailConfirm";
import EmailConfirmation from "./pages/EmailConfirmation";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";
import { ActiveTabProvider } from "./store/appState";
function App() {
  return (
    <Router>
      <ActiveTabProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/inicio" element={<Index />} />
          <Route path="/gastos" element={<Index />} />
          <Route path="/reportes" element={<Index />} />
          <Route path="/planes" element={<Index />} />
          <Route path="/perfil" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/confirm" element={<EmailConfirm />} />
          <Route path="/confirmacion" element={<EmailConfirmation />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </ActiveTabProvider>
    </Router>
  );
}

export default App;