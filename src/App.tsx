import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { ActiveTabProvider } from "./store/appState";
import { AuthProvider } from "./providers/AuthProvider";
import { AppLayout } from "./components/AppLayout";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ActiveTabProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/inicio" element={<Index />} />
              <Route path="/gastos" element={<Index />} />
              <Route path="/reportes" element={<Index />} />
              <Route path="/planes" element={<Index />} />
              <Route path="/perfil" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/reset" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ActiveTabProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;