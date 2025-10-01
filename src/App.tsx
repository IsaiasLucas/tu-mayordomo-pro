import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Ingresar from "./pages/Ingresar";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";


function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/inicio" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        
      </Router>
    </ThemeProvider>
  );
}

export default App;