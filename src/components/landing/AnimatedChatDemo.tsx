import { useState, useEffect, useMemo } from "react";
import { Check, CheckCheck, Mic, Camera, Send } from "lucide-react";
import { useCountryTerms } from "@/hooks/useCountryTerms";
import { formatCurrency, getCountryByCode } from "@/lib/countries";

interface ChatMessage {
  id: number;
  type: "user" | "bot";
  content: string;
  subtext?: string;
  time: string;
  isAudio?: boolean;
  isImage?: boolean;
}

// Currency-specific examples for the chat demo
interface CountryExamples {
  supermarketAmount: number;
  clientAmount: number;
  pharmacyAmount: number;
  monthExpenses: number;
  monthIncome: number;
  pharmacyName: string;
  // Natural language amount format
  supermarketText: string;
  clientText: string;
}

const getCountryExamples = (countryCode: string): CountryExamples => {
  switch (countryCode) {
    case 'CL': // Chile - Pesos chilenos
      return {
        supermarketAmount: 15000,
        clientAmount: 200000,
        pharmacyAmount: 8500,
        monthExpenses: 523500,
        monthIncome: 850000,
        pharmacyName: 'Farmacia Cruz Verde',
        supermarketText: '15 mil',
        clientText: '200 mil',
      };
    case 'AR': // Argentina - Pesos argentinos
      return {
        supermarketAmount: 25000,
        clientAmount: 350000,
        pharmacyAmount: 12000,
        monthExpenses: 890000,
        monthIncome: 1500000,
        pharmacyName: 'Farmacity',
        supermarketText: '25 mil',
        clientText: '350 mil',
      };
    case 'MX': // Mexico - Pesos mexicanos
      return {
        supermarketAmount: 1500,
        clientAmount: 15000,
        pharmacyAmount: 850,
        monthExpenses: 45000,
        monthIncome: 75000,
        pharmacyName: 'Farmacias del Ahorro',
        supermarketText: 'mil quinientos',
        clientText: '15 mil',
      };
    case 'CO': // Colombia - Pesos colombianos
      return {
        supermarketAmount: 150000,
        clientAmount: 2000000,
        pharmacyAmount: 85000,
        monthExpenses: 5200000,
        monthIncome: 8500000,
        pharmacyName: 'Drogas La Rebaja',
        supermarketText: '150 mil',
        clientText: '2 millones',
      };
    case 'PE': // Peru - Soles
      return {
        supermarketAmount: 150,
        clientAmount: 2000,
        pharmacyAmount: 85,
        monthExpenses: 5200,
        monthIncome: 8500,
        pharmacyName: 'Inkafarma',
        supermarketText: '150 soles',
        clientText: '2 mil soles',
      };
    case 'BR': // Brazil - Reais
      return {
        supermarketAmount: 250,
        clientAmount: 3500,
        pharmacyAmount: 120,
        monthExpenses: 8500,
        monthIncome: 15000,
        pharmacyName: 'Drogasil',
        supermarketText: '250 reais',
        clientText: '3500 reais',
      };
    case 'UY': // Uruguay - Pesos uruguayos
      return {
        supermarketAmount: 2500,
        clientAmount: 35000,
        pharmacyAmount: 1200,
        monthExpenses: 85000,
        monthIncome: 150000,
        pharmacyName: 'Farmashop',
        supermarketText: '2500 pesos',
        clientText: '35 mil',
      };
    case 'EC': // Ecuador - Dólares
      return {
        supermarketAmount: 75,
        clientAmount: 500,
        pharmacyAmount: 35,
        monthExpenses: 1800,
        monthIncome: 3000,
        pharmacyName: 'Fybeca',
        supermarketText: '75 dólares',
        clientText: '500 dólares',
      };
    case 'ES': // Spain - Euros
      return {
        supermarketAmount: 85,
        clientAmount: 1200,
        pharmacyAmount: 45,
        monthExpenses: 2500,
        monthIncome: 4000,
        pharmacyName: 'Farmacia',
        supermarketText: '85 euros',
        clientText: '1200 euros',
      };
    case 'US': // USA - Dólares
      return {
        supermarketAmount: 120,
        clientAmount: 1500,
        pharmacyAmount: 65,
        monthExpenses: 3500,
        monthIncome: 6000,
        pharmacyName: 'CVS Pharmacy',
        supermarketText: '120 dólares',
        clientText: '1500 dólares',
      };
    default: // Default - Dólares genéricos
      return {
        supermarketAmount: 100,
        clientAmount: 1000,
        pharmacyAmount: 50,
        monthExpenses: 3000,
        monthIncome: 5000,
        pharmacyName: 'Farmacia',
        supermarketText: '100',
        clientText: 'mil',
      };
  }
};

const getChatMessages = (
  countryCode: string,
  currencyCode: string,
  boletaTerm: string
): ChatMessage[] => {
  const examples = getCountryExamples(countryCode);
  const locale = getCountryByCode(countryCode)?.locale || 'es-CL';
  
  const fmt = (amount: number) => formatCurrency(amount, currencyCode as any, locale);
  
  return [
    {
      id: 1,
      type: "user",
      content: `Gasté ${examples.supermarketText} en el supermercado`,
      time: "10:30",
    },
    {
      id: 2,
      type: "bot",
      content: `✅ Gasto registrado: ${fmt(examples.supermarketAmount)}`,
      subtext: "Categoría: Alimentación 🛒",
      time: "10:30",
    },
    {
      id: 3,
      type: "user",
      content: `🎤 Audio: "Recibí ${examples.clientText} de un cliente hoy"`,
      time: "10:31",
      isAudio: true,
    },
    {
      id: 4,
      type: "bot",
      content: `✅ Ingreso registrado: ${fmt(examples.clientAmount)}`,
      subtext: "Categoría: Cliente 💼",
      time: "10:31",
    },
    {
      id: 5,
      type: "user",
      content: `📷 Foto de ${boletaTerm}`,
      time: "10:32",
      isImage: true,
    },
    {
      id: 6,
      type: "bot",
      content: `✅ Gasto registrado: ${fmt(examples.pharmacyAmount)}`,
      subtext: `Tienda: ${examples.pharmacyName} 💊`,
      time: "10:32",
    },
    {
      id: 7,
      type: "user",
      content: "¿Cuánto llevo gastado este mes?",
      time: "10:33",
    },
    {
      id: 8,
      type: "bot",
      content: "📊 Resumen del mes:",
      subtext: `Gastos: ${fmt(examples.monthExpenses)} | Ingresos: ${fmt(examples.monthIncome)}\nBalance: +${fmt(examples.monthIncome - examples.monthExpenses)} 💰`,
      time: "10:33",
    },
  ];
};

export const AnimatedChatDemo = () => {
  const { terms, countryCode } = useCountryTerms();
  const country = getCountryByCode(countryCode);
  const currencyCode = country?.currency || 'USD';
  
  // Memoize chat messages based on country
  const chatMessages = useMemo(
    () => getChatMessages(countryCode, currencyCode, terms.boleta),
    [countryCode, currencyCode, terms.boleta]
  );
  
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Reset animation when country changes
  useEffect(() => {
    setVisibleMessages([]);
    setCurrentMessageIndex(0);
    setIsPlaying(true);
  }, [countryCode]);

  useEffect(() => {
    if (!isPlaying || currentMessageIndex >= chatMessages.length) {
      if (currentMessageIndex >= chatMessages.length) {
        // Reset after a pause
        const resetTimeout = setTimeout(() => {
          setVisibleMessages([]);
          setCurrentMessageIndex(0);
        }, 4000);
        return () => clearTimeout(resetTimeout);
      }
      return;
    }

    const currentMessage = chatMessages[currentMessageIndex];
    
    // Show typing indicator for bot messages
    if (currentMessage.type === "bot") {
      setIsTyping(true);
      const typingTimeout = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages(prev => [...prev, currentMessage.id]);
        setCurrentMessageIndex(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(typingTimeout);
    } else {
      // User messages appear after a delay
      const messageTimeout = setTimeout(() => {
        setVisibleMessages(prev => [...prev, currentMessage.id]);
        setCurrentMessageIndex(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(messageTimeout);
    }
  }, [currentMessageIndex, isPlaying, chatMessages]);

  const handleReplay = () => {
    setVisibleMessages([]);
    setCurrentMessageIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="relative max-w-sm mx-auto">
      {/* Glow Effect */}
      <div className="absolute inset-0 -m-4 bg-gradient-to-r from-success/30 via-primary/20 to-accent/30 rounded-[3rem] blur-2xl opacity-60" />
      
      {/* Phone Frame */}
      <div className="relative bg-card/90 backdrop-blur-xl rounded-[2.5rem] p-3 shadow-elegant border border-border/50">
        <div className="bg-background rounded-[2rem] overflow-hidden">
          {/* WhatsApp Header */}
          <div className="bg-success px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-sm font-bold text-white">TM</span>
            </div>
            <div className="flex-1">
              <span className="text-white font-semibold text-sm">Tu Mayordomo</span>
              <p className="text-white/70 text-xs">
                {isTyping ? "escribiendo..." : "en línea"}
              </p>
            </div>
            <div className="flex items-center gap-4 text-white/80">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          
          {/* Chat Messages Container */}
          <div className="p-3 space-y-2 min-h-[380px] max-h-[380px] overflow-y-auto bg-[#0b141a] relative">
            {/* WhatsApp Background Pattern */}
            <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzBkMWIyNCIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9IiMxZjJjMzQiLz4KPC9zdmc+')]" />
            
            {chatMessages.map((message) => {
              const isVisible = visibleMessages.includes(message.id);
              
              if (!isVisible) return null;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`relative max-w-[85%] rounded-lg px-3 py-2 ${
                      message.type === "user"
                        ? "bg-[#005c4b] text-white rounded-br-none"
                        : "bg-[#202c33] text-white rounded-bl-none"
                    }`}
                  >
                    {message.isAudio && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-success/30 flex items-center justify-center">
                          <Mic className="w-4 h-4 text-success" />
                        </div>
                        <div className="flex-1 h-1 bg-white/20 rounded-full">
                          <div className="h-full w-3/4 bg-success rounded-full" />
                        </div>
                        <span className="text-xs text-white/60">0:03</span>
                      </div>
                    )}
                    
                    {message.isImage && (
                      <div className="mb-2 rounded-lg overflow-hidden bg-white/10 p-4 flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="w-8 h-8 text-white/50 mx-auto mb-1" />
                          <span className="text-xs text-white/50">Imagen de boleta</span>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {message.subtext && (
                      <p className="text-xs text-white/70 mt-1 whitespace-pre-line">
                        {message.subtext}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-white/50">{message.time}</span>
                      {message.type === "user" && (
                        <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-[#202c33] text-white rounded-lg rounded-bl-none px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Bar */}
          <div className="bg-[#202c33] px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 flex items-center gap-2">
              <span className="text-white/50 text-sm">Escribe un mensaje</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Replay Button */}
      {currentMessageIndex >= chatMessages.length && (
        <button
          onClick={handleReplay}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-full shadow-elegant transition-all animate-fade-in"
        >
          ↻ Ver de nuevo
        </button>
      )}
    </div>
  );
};
