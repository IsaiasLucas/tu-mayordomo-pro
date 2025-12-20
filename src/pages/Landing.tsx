import { MessageCircle, Mic, Receipt, TrendingUp, Check, ArrowRight, Sparkles, Users, FileSpreadsheet, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate("/auth");
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  const scrollToHowItWorks = () => {
    document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPricing = () => {
    document.getElementById("precios")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing-dark min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      
      {/* Floating Glow Orbs */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed top-40 right-20 w-96 h-96 bg-accent/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-40 left-1/3 w-80 h-80 bg-lilac/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative z-50 w-full">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-header flex items-center justify-center shadow-glow-sm">
              <span className="text-xl font-bold text-primary-foreground">TM</span>
            </div>
            <span className="text-xl font-bold text-foreground">Tu Mayordomo</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={scrollToHowItWorks} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Cómo funciona
            </button>
            <button onClick={scrollToPricing} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Precios
            </button>
            <a href="#ayuda" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Ayuda
            </a>
          </div>

          <Button 
            onClick={handleLogin}
            variant="outline" 
            size="sm"
            className="border-success/50 text-success hover:bg-success/10 hover:border-success"
          >
            Login
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            ¿Sabes en qué se va tu dinero…{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-lilac bg-clip-text text-transparent">
              de verdad?
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Registra gastos e ingresos por WhatsApp. Texto, audio o fotos de boletas.
            <br className="hidden md:block" />
            <span className="text-foreground font-medium">Sin planillas. Sin complicaciones.</span> En cualquier país hispano.
          </p>

          {/* Phone Mockup with Floating Elements */}
          <div className="relative max-w-sm mx-auto my-12 md:my-16">
            {/* Glow Ring */}
            <div className="absolute inset-0 -m-8 md:-m-12 rounded-full bg-gradient-to-r from-primary via-accent to-lilac opacity-20 blur-3xl animate-pulse" />
            <div className="absolute inset-0 -m-4 md:-m-6 rounded-full border-2 border-primary/30" />
            
            {/* Floating Icons */}
            <div className="absolute -top-4 -left-4 md:-top-8 md:-left-8 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-card/80 backdrop-blur-lg shadow-glass flex items-center justify-center animate-bounce" style={{ animationDelay: "0s", animationDuration: "3s" }}>
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="absolute -top-2 -right-6 md:-top-4 md:-right-10 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-card/80 backdrop-blur-lg shadow-glass flex items-center justify-center animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}>
              <Mic className="w-6 h-6 text-accent" />
            </div>
            <div className="absolute -bottom-2 -left-6 md:-bottom-4 md:-left-10 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-card/80 backdrop-blur-lg shadow-glass flex items-center justify-center animate-bounce" style={{ animationDelay: "1s", animationDuration: "4s" }}>
              <Receipt className="w-6 h-6 text-success" />
            </div>
            <div className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-card/80 backdrop-blur-lg shadow-glass flex items-center justify-center animate-bounce" style={{ animationDelay: "1.5s", animationDuration: "3.2s" }}>
              <TrendingUp className="w-6 h-6 text-lilac" />
            </div>

            {/* Phone Frame */}
            <div className="relative bg-card/90 backdrop-blur-xl rounded-[2.5rem] p-3 shadow-elegant border border-border/50">
              <div className="bg-background rounded-[2rem] overflow-hidden">
                {/* Status Bar */}
                <div className="bg-success px-4 py-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">TM</span>
                  </div>
                  <span className="text-white font-medium text-sm">Tu Mayordomo</span>
                </div>
                
                {/* Chat Messages */}
                <div className="p-4 space-y-3 min-h-[280px]">
                  {/* User Message 1 */}
                  <div className="flex justify-end">
                    <div className="bg-success/90 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Gasto supermercado $23.000</p>
                      <span className="text-[10px] text-white/70 float-right mt-1">10:30</span>
                    </div>
                  </div>
                  
                  {/* Bot Response 1 */}
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground rounded-2xl rounded-bl-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm">✅ Gasto registrado: <strong>$23.000</strong></p>
                      <p className="text-xs text-muted-foreground">Categoría: Alimentación 🛒</p>
                    </div>
                  </div>

                  {/* User Message 2 */}
                  <div className="flex justify-end">
                    <div className="bg-success/90 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Recibí $120.000 de cliente</p>
                      <span className="text-[10px] text-white/70 float-right mt-1">10:32</span>
                    </div>
                  </div>

                  {/* Bot Response 2 */}
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground rounded-2xl rounded-bl-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm">✅ Ingreso registrado: <strong>$120.000</strong></p>
                      <p className="text-xs text-muted-foreground">Categoría: Cliente 💼</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              onClick={handleCreateAccount}
              size="lg" 
              className="bg-gradient-header hover:opacity-90 text-primary-foreground shadow-elegant px-8 py-6 text-lg font-semibold w-full sm:w-auto"
            >
              Crear cuenta gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              onClick={scrollToHowItWorks}
              size="lg" 
              variant="outline"
              className="border-success text-success hover:bg-success/10 px-8 py-6 text-lg font-semibold w-full sm:w-auto"
            >
              Ver cómo funciona
            </Button>
          </div>

          {/* Trust Microtext */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              <span>30 mensajes gratis cada mes</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              <span>Funciona en todos los países hispanos</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              <span>Solo necesitas WhatsApp</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Demo Section */}
      <section id="como-funciona" className="relative z-10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">
              Prueba Tu Mayordomo
            </span>
            <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-4">
              Mira lo fácil que es registrar tus gastos por WhatsApp
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Envía un mensaje y tu gasto o ingreso queda registrado automáticamente.
            </p>
          </div>

          {/* 3 Steps */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-card/50 backdrop-blur-lg rounded-3xl p-8 border border-border/50 h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-header flex items-center justify-center mb-6 shadow-glow-sm">
                  <MessageCircle className="w-8 h-8 text-primary-foreground" />
                </div>
                <span className="text-primary font-bold text-sm">Paso 1</span>
                <h3 className="text-xl font-bold mt-2 mb-3">Envía un mensaje</h3>
                <p className="text-muted-foreground">
                  Texto, audio o foto de boleta por WhatsApp. Como si le escribieras a un amigo.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-lilac/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-card/50 backdrop-blur-lg rounded-3xl p-8 border border-border/50 h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-accent to-lilac flex items-center justify-center mb-6 shadow-glow-sm">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <span className="text-accent font-bold text-sm">Paso 2</span>
                <h3 className="text-xl font-bold mt-2 mb-3">Procesamiento inteligente</h3>
                <p className="text-muted-foreground">
                  Tu Mayordomo identifica el monto, la categoría y la fecha automáticamente.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-success/20 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-card/50 backdrop-blur-lg rounded-3xl p-8 border border-border/50 h-full">
                <div className="w-16 h-16 rounded-2xl bg-success flex items-center justify-center mb-6 shadow-glow-sm">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <span className="text-success font-bold text-sm">Paso 3</span>
                <h3 className="text-xl font-bold mt-2 mb-3">Registro automático</h3>
                <p className="text-muted-foreground">
                  Todo aparece al instante en tu panel. Organizado y listo para consultar.
                </p>
              </div>
            </div>
          </div>

          {/* Highlight */}
          <div className="text-center mt-16">
            <p className="text-xl md:text-2xl font-medium text-foreground mb-8">
              Olvídate de Excel y de apps complicadas.
            </p>
            <Button 
              onClick={handleCreateAccount}
              size="lg"
              className="bg-gradient-header hover:opacity-90 text-primary-foreground shadow-elegant px-8 py-6 text-lg font-semibold"
            >
              Comenzar ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="relative z-10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Planes simples, sin letra chica
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="relative bg-card/30 backdrop-blur-lg rounded-3xl p-8 border border-border/50">
              <h3 className="text-xl font-bold mb-2">Gratis</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground ml-2">/ mes</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span>30 mensajes por mes</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Registro automático</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Dashboard básico</span>
                </li>
              </ul>

              <Button 
                onClick={handleCreateAccount}
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary/10"
                size="lg"
              >
                Crear cuenta gratis
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-lilac rounded-3xl blur-xl opacity-30" />
              <div className="relative bg-card/50 backdrop-blur-lg rounded-3xl p-8 border-2 border-primary/50 shadow-elegant">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-header text-white text-xs font-bold px-4 py-1 rounded-full">
                  RECOMENDADO
                </div>
                
                <h3 className="text-xl font-bold mb-2 mt-2">Premium</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">$3</span>
                  <span className="text-muted-foreground ml-2">/ mes</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">o $25 / año (ahorra 30%)</p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="font-medium">Mensajes ilimitados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Dashboard completo</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Presupuestos y metas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Historial sin límites</span>
                  </li>
                </ul>

                <Button 
                  onClick={handleCreateAccount}
                  className="w-full bg-gradient-header hover:opacity-90 text-primary-foreground shadow-elegant"
                  size="lg"
                >
                  Pasar a Premium
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is It For Section */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              ¿Para quién es Tu Mayordomo?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-border/50 text-center group hover:border-primary/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-sm md:text-base">Personas desordenadas</h3>
            </div>

            <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-border/50 text-center group hover:border-accent/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/30 transition-colors">
                <Users className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-semibold text-sm md:text-base">Autónomos y freelancers</h3>
            </div>

            <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-border/50 text-center group hover:border-destructive/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-destructive/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-destructive/30 transition-colors">
                <FileSpreadsheet className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="font-semibold text-sm md:text-base">Personas que odian Excel</h3>
            </div>

            <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-border/50 text-center group hover:border-success/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-success/30 transition-colors">
                <Globe className="w-7 h-7 text-success" />
              </div>
              <h3 className="font-semibold text-sm md:text-base">Migrantes y multi-país</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-lilac rounded-3xl blur-2xl opacity-20" />
            <div className="relative bg-card/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-border/50 text-center shadow-elegant">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">
                Empieza a controlar tu dinero hoy
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Solo necesitas WhatsApp
              </p>
              <Button 
                onClick={handleCreateAccount}
                size="lg"
                className="bg-gradient-header hover:opacity-90 text-primary-foreground shadow-elegant px-10 py-6 text-lg font-semibold"
              >
                Crear cuenta gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-border/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Tu Mayordomo – Controla tu dinero sin esfuerzo
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
