import { MessageCircle, Mic, Receipt, TrendingUp, Check, ArrowRight, Sparkles, Users, FileSpreadsheet, Globe, Target, PieChart, BarChart3, Wallet, Phone, UserCheck, Smartphone, Building2, Link2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCountryTerms } from "@/hooks/useCountryTerms";
import { AnimatedChatDemo } from "@/components/landing/AnimatedChatDemo";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

// Logo
import tuMayordomoLogo from "@/assets/tu-mayordomo-logo.png";

// Feature screenshots
import featureWhatsapp from "@/assets/landing/feature-whatsapp.jpg";
import featureGastos from "@/assets/landing/feature-gastos.jpg";
import featureAhorro from "@/assets/landing/feature-ahorro.jpg";
import featureReportes from "@/assets/landing/feature-reportes.jpg";
import featureEvolucion from "@/assets/landing/feature-evolucion.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const { terms } = useCountryTerms();

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
      
      {/* Floating Glow Orbs - Hidden on small screens for performance */}
      <div className="hidden sm:block fixed top-20 left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/20 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
      <div className="hidden sm:block fixed top-40 right-10 md:right-20 w-64 md:w-96 h-64 md:h-96 bg-accent/15 rounded-full blur-[100px] md:blur-[120px] pointer-events-none" />
      <div className="hidden sm:block fixed bottom-40 left-1/4 md:left-1/3 w-56 md:w-80 h-56 md:h-80 bg-lilac/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative z-50 w-full">
        <nav className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img src={tuMayordomoLogo} alt="Tu Mayordomo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-contain flex-shrink-0" />
            <span className="text-base sm:text-xl font-bold text-foreground truncate">Tu Mayordomo</span>
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
            className="border-success/50 text-success hover:bg-success/10 hover:border-success text-xs sm:text-sm px-3 sm:px-4 flex-shrink-0"
          >
            Login
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-8 pb-16 sm:pt-12 sm:pb-20 md:pt-20 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[2.5rem] sm:text-5xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 px-2">
            ¿Sabes en qué se va tu dinero…{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-lilac bg-clip-text text-transparent">
              de verdad?
            </span>
          </h1>
          
          <p className="text-[1.35rem] sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
            Registra gastos e ingresos por WhatsApp. Texto, audio o fotos de {terms.boletas}.
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 px-2">
            <Button 
              onClick={handleCreateAccount}
              size="lg" 
              className="bg-gradient-header hover:opacity-90 text-primary-foreground shadow-elegant px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold w-full sm:w-auto"
            >
              Crear cuenta gratis
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button 
              onClick={scrollToHowItWorks}
              size="lg" 
              variant="outline"
              className="border-success text-success hover:bg-success/10 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold w-full sm:w-auto"
            >
              Ver cómo funciona
            </Button>
          </div>

          {/* Trust Microtext */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 md:gap-8 text-lg sm:text-lg text-muted-foreground px-2">
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5 text-success flex-shrink-0" />
              <span>30 mensajes gratis cada mes</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5 text-success flex-shrink-0" />
              <span>Funciona en todos los países hispanos</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5 text-success flex-shrink-0" />
              <span>Solo necesitas WhatsApp</span>
            </div>
          </div>
        </div>
      </section>

      {/* Primeros Pasos - Animated Onboarding Section */}
      <section className="relative z-10 py-12 sm:py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-10 sm:mb-16">
              <span className="text-success text-lg sm:text-lg font-semibold tracking-wider uppercase">
                Comienza en minutos
              </span>
              <h2 className="text-[1.875rem] sm:text-4xl md:text-4xl font-bold mt-2 mb-3 sm:mb-4 px-2">
                ¿Cómo empezar a usar Tu Mayordomo?
              </h2>
              <p className="text-muted-foreground text-xl sm:text-xl max-w-xl mx-auto px-2">
                Solo 3 pasos simples para comenzar a controlar tus finanzas
              </p>
            </div>
          </ScrollReveal>

          {/* Animated Steps Timeline */}
          <div className="relative max-w-5xl mx-auto">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-32 left-1/6 right-1/6 h-1 bg-gradient-to-r from-primary via-accent to-success rounded-full opacity-30" />
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-4">
              {/* Step 1 - Crear cuenta y configurar WhatsApp */}
              <ScrollReveal delay={0} direction="up">
                <div className="relative group h-full">
                {/* Animated Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-700" />
                
                <div className="relative bg-card/50 backdrop-blur-lg rounded-3xl p-6 border border-border/50 h-full">
                  {/* Step Number with Pulse Animation */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-primary/40 blur-lg animate-pulse" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-header flex items-center justify-center shadow-glow-sm">
                      <span className="text-2xl font-bold text-primary-foreground">1</span>
                    </div>
                  </div>
                  
                  <h3 className="text-[1.375rem] sm:text-2xl font-bold mb-3 flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-primary" />
                    Crea tu cuenta y configura WhatsApp
                  </h3>
                  
                  <p className="text-muted-foreground text-lg sm:text-lg mb-6">
                    Regístrate gratis y completa tu perfil con tu número de WhatsApp. 
                    <strong className="text-foreground"> Esto es esencial</strong> – Tu Mayordomo solo responde a números verificados.
                  </p>
                  
                  {/* Animated Phone Card Mockup */}
                  <div className="relative mt-4">
                    <div className="bg-background/80 rounded-2xl p-4 border border-primary/30 shadow-elegant transform group-hover:scale-[1.02] transition-transform duration-500">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Configura tu WhatsApp</p>
                          <p className="text-xs text-muted-foreground">Paso requerido</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded-full w-3/4" />
                        <div className="h-3 bg-muted rounded-full w-1/2" />
                      </div>
                      <div className="mt-4 h-10 bg-gradient-header rounded-xl flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Completar Perfil</span>
                      </div>
                    </div>
                    {/* Floating Arrow */}
                    <div className="hidden md:flex absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center animate-pulse">
                      <ArrowRight className="w-6 h-6 text-primary/50" />
                    </div>
                  </div>
                </div>
              </div>
              </ScrollReveal>

              {/* Step 2 - Completa el formulario */}
              <ScrollReveal delay={150} direction="up">
                <div className="relative group h-full">
                  {/* Animated Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-lilac/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-700" />
                
                <div className="relative bg-card/50 backdrop-blur-lg rounded-3xl p-6 border border-border/50 h-full">
                  {/* Step Number with Pulse Animation */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-accent/40 blur-lg animate-pulse" style={{ animationDelay: "0.5s" }} />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-r from-accent to-lilac flex items-center justify-center shadow-glow-sm">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                  </div>
                  
                  <h3 className="text-[1.375rem] sm:text-xl font-bold mb-3 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-accent" />
                    Completa tu perfil
                  </h3>
                  
                  <p className="text-muted-foreground text-lg sm:text-base mb-6">
                    Ingresa tu nombre, número de WhatsApp, país y moneda. 
                    <strong className="text-foreground"> Tu país se detecta automáticamente</strong> para facilitar el proceso.
                  </p>
                  
                  {/* Animated Form Mockup */}
                  <div className="relative mt-4">
                    <div className="bg-background/80 rounded-2xl p-4 border border-accent/30 shadow-elegant transform group-hover:scale-[1.02] transition-transform duration-500">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Nombre</p>
                          <div className="h-8 bg-muted rounded-lg" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">WhatsApp</p>
                          <div className="h-8 bg-muted rounded-lg flex items-center px-3">
                            <span className="text-xs text-foreground/70">+54 11 1234-5678</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">País</p>
                            <div className="h-8 bg-muted rounded-lg flex items-center px-2 gap-1">
                              <span className="text-sm">🇦🇷</span>
                              <span className="text-xs">Argentina</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Moneda</p>
                            <div className="h-8 bg-muted rounded-lg flex items-center px-2">
                              <span className="text-xs">$ ARS</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Floating Arrow */}
                    <div className="hidden md:flex absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center animate-pulse">
                      <ArrowRight className="w-6 h-6 text-accent/50" />
                    </div>
                  </div>
                </div>
              </div>
              </ScrollReveal>

              {/* Step 3 - Usar el botón de WhatsApp */}
              <ScrollReveal delay={300} direction="up">
                <div className="relative group h-full">
                  {/* Animated Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-success/30 to-primary/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-700" />
                
                <div className="relative bg-card/50 backdrop-blur-lg rounded-3xl p-6 border border-border/50 h-full">
                  {/* Step Number with Pulse Animation */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-success/40 blur-lg animate-pulse" style={{ animationDelay: "1s" }} />
                    <div className="relative w-16 h-16 rounded-2xl bg-success flex items-center justify-center shadow-glow-sm">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                  </div>
                  
                  <h3 className="text-[1.375rem] sm:text-xl font-bold mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-success" />
                    ¡Comienza a usar Tu Mayordomo!
                  </h3>
                  
                  <p className="text-muted-foreground text-lg sm:text-base mb-6">
                    Toca el <strong className="text-foreground">botón de WhatsApp</strong> flotante en la app y empieza a registrar 
                    tus gastos e ingresos. ¡Así de fácil!
                  </p>
                  
                  {/* Animated App Interface Mockup */}
                  <div className="relative mt-4">
                    <div className="bg-background/80 rounded-2xl p-4 border border-success/30 shadow-elegant transform group-hover:scale-[1.02] transition-transform duration-500">
                      {/* Mini Nav Bar */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <span className="text-xs">🏠</span>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                            <span className="text-xs">💰</span>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                            <span className="text-xs">📊</span>
                          </div>
                        </div>
                        {/* Floating WhatsApp Button with Animation */}
                        <div className="relative">
                          <div className="absolute inset-0 w-12 h-12 rounded-full bg-success/50 blur-lg animate-ping" />
                          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-success to-primary flex items-center justify-center shadow-glow-sm">
                            <MessageCircle className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-xs text-muted-foreground">
                        Toca aquí para abrir WhatsApp
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              </ScrollReveal>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-8 sm:mt-12 px-2">
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                <Check className="w-4 h-4 text-success inline mr-2" />
                Solo toma <span className="text-foreground font-semibold">2 minutos</span> configurar todo
              </p>
              <Button 
                onClick={handleCreateAccount}
                size="lg"
                className="bg-gradient-header hover:opacity-90 text-primary-foreground shadow-elegant px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold w-full sm:w-auto"
              >
                Crear mi cuenta gratis
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Demo Section */}
      <section id="como-funciona" className="relative z-10 py-12 sm:py-20 md:py-32">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-primary text-base sm:text-sm font-semibold tracking-wider uppercase">
                Mira Tu Mayordomo en acción
              </span>
              <h2 className="text-[1.5rem] sm:text-2xl md:text-4xl font-bold mt-2 mb-3 sm:mb-4 px-2">
                Así de fácil es registrar tus gastos
              </h2>
              <p className="text-muted-foreground text-lg sm:text-lg max-w-xl mx-auto px-2">
                Texto, audio o foto – Tu Mayordomo entiende todo y registra automáticamente.
              </p>
            </div>
          </ScrollReveal>

          {/* Animated Chat Demo */}
          <ScrollReveal delay={100}>
            <div className="max-w-lg mx-auto mb-12 sm:mb-20 px-2">
              <AnimatedChatDemo />
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto mt-8 sm:mt-16">
            {/* Step 1 */}
            <ScrollReveal delay={0}>
              <div className="relative group h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-card/50 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-border/50 h-full">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-header flex items-center justify-center mb-4 sm:mb-6 shadow-glow-sm">
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  <span className="text-primary font-bold text-lg sm:text-lg">Paso 1</span>
                  <h3 className="text-[1.375rem] sm:text-2xl font-bold mt-2 mb-2 sm:mb-3">Envía un mensaje</h3>
                  <p className="text-muted-foreground text-lg sm:text-xl">
                    Texto, audio o foto de {terms.boleta} por WhatsApp. Como si le escribieras a un amigo.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal delay={100}>
              <div className="relative group h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-lilac/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-card/50 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-border/50 h-full">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r from-accent to-lilac flex items-center justify-center mb-4 sm:mb-6 shadow-glow-sm">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <span className="text-accent font-bold text-lg sm:text-lg">Paso 2</span>
                  <h3 className="text-[1.375rem] sm:text-2xl font-bold mt-2 mb-2 sm:mb-3">Procesamiento inteligente</h3>
                  <p className="text-muted-foreground text-lg sm:text-xl">
                    Tu Mayordomo identifica el monto, la categoría y la fecha automáticamente.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal delay={200}>
              <div className="relative group h-full sm:col-span-2 md:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-r from-success/20 to-primary/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-card/50 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-border/50 h-full">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-success flex items-center justify-center mb-4 sm:mb-6 shadow-glow-sm">
                    <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <span className="text-success font-bold text-lg sm:text-lg">Paso 3</span>
                  <h3 className="text-[1.375rem] sm:text-2xl font-bold mt-2 mb-2 sm:mb-3">Registro automático</h3>
                  <p className="text-muted-foreground text-lg sm:text-xl">
                    Todo aparece al instante en tu panel. Organizado y listo para consultar.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Highlight */}
          <ScrollReveal>
            <div className="text-center mt-10 sm:mt-16 px-2">
              <p className="text-[1.375rem] sm:text-2xl md:text-3xl font-medium text-foreground mb-6 sm:mb-8">
                Olvídate de Excel y de apps complicadas.
              </p>
              <Button 
                onClick={handleCreateAccount}
                size="lg"
                className="bg-gradient-header hover:opacity-90 text-primary-foreground shadow-elegant px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold w-full sm:w-auto"
              >
                Comenzar ahora
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section id="funciones" className="relative z-10 py-12 sm:py-20 md:py-32">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-10 sm:mb-16">
              <span className="text-accent text-lg sm:text-lg font-semibold tracking-wider uppercase">
                Todo lo que puedes hacer
              </span>
              <h2 className="text-[1.875rem] sm:text-4xl md:text-4xl font-bold mt-2 mb-3 sm:mb-4 px-2">
                Más que solo registrar gastos
              </h2>
              <p className="text-muted-foreground text-xl sm:text-xl max-w-xl mx-auto px-2">
                Un dashboard completo para controlar tus finanzas personales o de tu negocio.
              </p>
            </div>
          </ScrollReveal>

          {/* Feature 1 - WhatsApp Real */}
          <ScrollReveal direction="left">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-16 items-center max-w-6xl mx-auto mb-12 sm:mb-20 md:mb-32">
              <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-success/20 text-success text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  WhatsApp
                </div>
                <h3 className="text-[1.5rem] sm:text-3xl md:text-3xl font-bold mb-3 sm:mb-4">
                  Registra gastos como si chatearas con un amigo
                </h3>
                <p className="text-muted-foreground text-xl sm:text-xl mb-4 sm:mb-6">
                  Escribe naturalmente: "Me compré unos audífonos de 5 mil pesos hoy" y Tu Mayordomo 
                  entiende el monto, la categoría y la fecha automáticamente.
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-xl sm:text-xl">
                    <Check className="w-5 h-5 sm:w-6 sm:h-6 text-success flex-shrink-0" />
                    <span>Texto, audio o fotos de {terms.boletas}</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-xl sm:text-xl">
                    <Check className="w-5 h-5 sm:w-6 sm:h-6 text-success flex-shrink-0" />
                    <span>Categorización automática con IA</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-xl sm:text-xl">
                    <Check className="w-5 h-5 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                    <span>Respuesta inmediata de confirmación</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-success/30 to-primary/30 rounded-2xl sm:rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
                <img 
                  src={featureWhatsapp} 
                  alt="WhatsApp chat con Tu Mayordomo" 
                  className="relative rounded-2xl sm:rounded-3xl shadow-elegant border border-border/50 w-full max-w-xs sm:max-w-sm mx-auto"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Feature 2 - Gastos y Presupuesto */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-16 items-center max-w-6xl mx-auto mb-12 sm:mb-20 md:mb-32">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl sm:rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <img 
                src={featureGastos} 
                alt="Panel de gastos y presupuesto" 
                className="relative rounded-2xl sm:rounded-3xl shadow-elegant border border-border/50 w-full max-w-xs sm:max-w-sm mx-auto"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/20 text-primary text-sm sm:text-base font-medium mb-3 sm:mb-4">
                <Wallet className="w-4 h-4 sm:w-4 sm:h-4" />
                Presupuesto
              </div>
              <h3 className="text-[1.5rem] sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                Controla tu presupuesto mensual
              </h3>
              <p className="text-muted-foreground text-lg sm:text-lg mb-4 sm:mb-6">
                Define cuánto quieres gastar al mes y ve en tiempo real cuánto llevas gastado. 
                Nunca más te sorprenderá el fin de mes.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-lg sm:text-lg">
                  <Check className="w-5 h-5 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                  <span>Presupuesto mensual personalizable</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-lg sm:text-lg">
                  <Check className="w-5 h-5 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                  <span>Ingresos vs gastos en un vistazo</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-lg sm:text-lg">
                  <Check className="w-5 h-5 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                  <span>Descarga PDFs de tus movimientos</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3 - Metas de Ahorro */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-16 items-center max-w-6xl mx-auto mb-12 sm:mb-20 md:mb-32">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent/20 text-accent text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                Metas
              </div>
              <h3 className="text-[1.375rem] sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                Crea metas de ahorro y alcánzalas
              </h3>
              <p className="text-muted-foreground text-lg sm:text-lg mb-4 sm:mb-6">
                ¿Quieres un iPhone 15? ¿Ropa nueva? Crea una meta, agrega ahorros cuando puedas 
                y visualiza tu progreso hasta lograrlo.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-lg sm:text-base">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                  <span>Metas ilimitadas</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-lg sm:text-base">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                  <span>Barra de progreso visual</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-lg sm:text-base">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                  <span>Fecha límite opcional</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-lilac/30 rounded-2xl sm:rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <img 
                src={featureAhorro} 
                alt="Metas de ahorro" 
                className="relative rounded-2xl sm:rounded-3xl shadow-elegant border border-border/50 w-full max-w-xs sm:max-w-sm mx-auto"
              />
            </div>
          </div>

          {/* Feature 4 - Reportes */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-16 items-center max-w-6xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-lilac/30 to-primary/30 rounded-2xl sm:rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative flex gap-2 sm:gap-4 justify-center">
                <img 
                  src={featureReportes} 
                  alt="Reportes por categoría" 
                  className="rounded-xl sm:rounded-3xl shadow-elegant border border-border/50 w-full max-w-[45%]"
                />
                <img 
                  src={featureEvolucion} 
                  alt="Evolución temporal" 
                  className="rounded-xl sm:rounded-3xl shadow-elegant border border-border/50 w-full max-w-[45%]"
                />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-lilac/20 text-lilac text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                <PieChart className="w-3 h-3 sm:w-4 sm:h-4" />
                Reportes
              </div>
              <h3 className="text-[1.375rem] sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                Reportes detallados y gráficos
              </h3>
              <p className="text-muted-foreground text-lg sm:text-lg mb-4 sm:mb-6">
                Entiende exactamente en qué se va tu dinero con gráficos de categorías, 
                evolución temporal y reportes descargables en PDF.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-lg sm:text-base">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                  <span>Gráfico de gastos por categoría</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-lg sm:text-base">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                  <span>Evolución de ingresos y egresos</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-lg sm:text-base">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                  <span>Descarga reportes PDF semanales y mensuales</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 5 - Cuentas Empresa con Colaboradores */}
          <ScrollReveal direction="up" delay={100}>
            <div className="max-w-6xl mx-auto mt-12 sm:mt-20 md:mt-32">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-lilac/20 rounded-2xl sm:rounded-3xl blur-2xl opacity-50" />
                <div className="relative bg-card/50 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 border border-border/50">
                  <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/20 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                        <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        Cuentas Empresa
                      </div>
                      <h3 className="text-[1.375rem] sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                        Gestiona las finanzas de tu empresa en equipo
                      </h3>
                      <p className="text-muted-foreground text-lg sm:text-lg mb-4 sm:mb-6">
                        Al crear una cuenta de tipo <strong className="text-foreground">Empresa</strong>, obtienes acceso a 
                        funcionalidades de colaboración únicas para equipos de trabajo.
                      </p>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex gap-3 sm:gap-4 items-start p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-background/50 border border-border/30">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 text-base sm:text-base">Genera un enlace de invitación</h4>
                            <p className="text-sm sm:text-sm text-muted-foreground">
                              Crea un código único desde tu panel para invitar colaboradores a tu empresa.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 sm:gap-4 items-start p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-background/50 border border-border/30">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 text-base sm:text-base">Tus colaboradores se unen fácilmente</h4>
                            <p className="text-sm sm:text-sm text-muted-foreground">
                              Solo necesitan el código y su número de WhatsApp registrado en Tu Mayordomo.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 sm:gap-4 items-start p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-background/50 border border-border/30">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 text-base sm:text-base">Cada uno registra desde su WhatsApp</h4>
                            <p className="text-sm sm:text-sm text-muted-foreground">
                              Los gastos e ingresos que registran se agregan automáticamente al dashboard de la empresa.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Visual Mockup */}
                    <div className="relative">
                      <div className="bg-background/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-primary/30 shadow-elegant">
                        {/* Header */}
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border/30">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-header flex items-center justify-center">
                            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-sm sm:text-base">Mi Empresa S.A.</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Cuenta Empresa</p>
                          </div>
                        </div>
                        
                        {/* Collaborators */}
                        <div className="mb-4 sm:mb-6">
                          <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center gap-2">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                            Colaboradores activos
                          </p>
                          <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-muted/50">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] sm:text-xs font-bold">JC</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium truncate">Juan Carlos</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">+54 11 ****-1234</p>
                              </div>
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-muted/50">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent/20 flex items-center justify-center text-[10px] sm:text-xs font-bold">ML</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium truncate">María López</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">+56 9 ****-5678</p>
                              </div>
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-muted/50">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-lilac/20 flex items-center justify-center text-[10px] sm:text-xs font-bold">PR</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium truncate">Pedro Ramírez</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">+52 55 ****-9012</p>
                              </div>
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Invite Link */}
                        <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/30">
                          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">Código de invitación:</p>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <code className="flex-1 bg-background px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-mono truncate">
                              EMP-A8X2-K9M3
                            </code>
                            <button className="px-2 sm:px-3 py-1.5 sm:py-2 bg-primary text-white text-xs sm:text-sm rounded-md sm:rounded-lg flex-shrink-0">
                              Copiar
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Floating Badge */}
                      <div className="absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-4 bg-success text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-elegant animate-pulse">
                        ✨ Colaboración en tiempo real
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="relative z-10 py-12 sm:py-20 md:py-32">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-[1.5rem] sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
                Planes simples, sin letra chica
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <ScrollReveal delay={0} direction="left">
              <div className="relative bg-card/30 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-border/50 h-full">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Gratis</h3>
                <div className="mb-4 sm:mb-6">
                  <span className="text-4xl sm:text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground ml-2 text-base sm:text-lg">/ mes</span>
                </div>
                
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <li className="flex items-center gap-2 sm:gap-3 text-lg sm:text-lg">
                    <Check className="w-5 h-5 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                    <span>30 mensajes por mes</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-lg sm:text-lg">
                    <Check className="w-5 h-5 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                    <span>Registro automático</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-lg sm:text-lg">
                    <Check className="w-5 h-5 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                    <span>Dashboard básico</span>
                  </li>
                </ul>

                <Button 
                  onClick={handleCreateAccount}
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary/10 text-sm sm:text-base"
                  size="lg"
                >
                  Crear cuenta gratis
                </Button>
              </div>
            </ScrollReveal>

            {/* Premium Plan */}
            <ScrollReveal delay={100} direction="right">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-lilac rounded-2xl sm:rounded-3xl blur-xl opacity-30" />
              <div className="relative bg-card/50 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-primary/50 shadow-elegant">
                <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 bg-gradient-header text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 rounded-full whitespace-nowrap">
                  RECOMENDADO
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-2 mt-2">Premium</h3>
                <div className="mb-2">
                  <span className="text-4xl sm:text-5xl font-bold">$3</span>
                  <span className="text-muted-foreground ml-2 text-base sm:text-lg">/ mes</span>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">o $25 / año (ahorra 30%)</p>
                
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <li className="flex items-center gap-2 sm:gap-3 text-lg sm:text-lg">
                    <Check className="w-5 h-5 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                    <span className="font-medium">Mensajes ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-lg sm:text-lg">
                    <Check className="w-5 h-5 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                    <span>Dashboard completo</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-lg sm:text-lg">
                    <Check className="w-5 h-5 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                    <span>Presupuestos y metas</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-lg sm:text-lg">
                    <Check className="w-5 h-5 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                    <span>Historial sin límites</span>
                  </li>
                </ul>

                <Button 
                  onClick={handleCreateAccount}
                  className="w-full bg-gradient-header hover:opacity-90 text-primary-foreground shadow-elegant text-sm sm:text-base"
                  size="lg"
                >
                  Pasar a Premium
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Who Is It For Section */}
      <section className="relative z-10 py-12 sm:py-20 md:py-32">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-[1.375rem] sm:text-2xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
                ¿Para quién es Tu Mayordomo?
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto">
            <div className="bg-card/30 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50 text-center group hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:bg-primary/30 transition-colors">
                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-sm sm:text-sm md:text-base">Personas desordenadas</h3>
            </div>

            <div className="bg-card/30 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50 text-center group hover:border-accent/50 transition-colors">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:bg-accent/30 transition-colors">
                <Users className="w-5 h-5 sm:w-7 sm:h-7 text-accent" />
              </div>
              <h3 className="font-semibold text-sm sm:text-sm md:text-base">Autónomos y freelancers</h3>
            </div>

            <div className="bg-card/30 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50 text-center group hover:border-destructive/50 transition-colors">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-destructive/20 flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:bg-destructive/30 transition-colors">
                <FileSpreadsheet className="w-5 h-5 sm:w-7 sm:h-7 text-destructive" />
              </div>
              <h3 className="font-semibold text-sm sm:text-sm md:text-base">Personas que odian Excel</h3>
            </div>

            <div className="bg-card/30 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50 text-center group hover:border-success/50 transition-colors">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:bg-success/30 transition-colors">
                <Globe className="w-5 h-5 sm:w-7 sm:h-7 text-success" />
              </div>
              <h3 className="font-semibold text-sm sm:text-sm md:text-base">Migrantes y multi-país</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-12 sm:py-20 md:py-32">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="relative max-w-3xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-lilac rounded-2xl sm:rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-card/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-border/50 text-center shadow-elegant">
                <h2 className="text-[1.375rem] sm:text-2xl md:text-4xl font-bold mb-3 sm:mb-4">
                  Empieza a controlar tu dinero hoy
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                  Solo necesitas WhatsApp
                </p>
                <Button 
                  onClick={handleCreateAccount}
                  size="lg"
                  className="bg-gradient-header hover:opacity-90 text-primary-foreground shadow-elegant px-6 sm:px-10 py-5 sm:py-6 text-base sm:text-lg font-semibold w-full sm:w-auto"
                >
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 sm:py-8 border-t border-border/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={tuMayordomoLogo} alt="Tu Mayordomo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg object-contain" />
            <span className="font-semibold text-sm sm:text-base">Tu Mayordomo</span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Controla tu dinero sin esfuerzo
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
