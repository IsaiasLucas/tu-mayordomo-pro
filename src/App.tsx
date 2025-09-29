import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Ingresar from "./pages/Ingresar";
import CriarContaEmpresa from "./pages/CriarContaEmpresa";
import LoginSecundario from "./pages/LoginSecundario";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/ingresar" element={<Ingresar />} />
        <Route path="/criar-conta-empresa" element={<CriarContaEmpresa />} />
        <Route path="/login-secundario" element={<LoginSecundario />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;