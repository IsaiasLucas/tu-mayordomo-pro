import { useState, useEffect } from "react";
import { Check, CheckCheck, Mic, Camera, Send } from "lucide-react";

interface ChatMessage {
  id: number;
  type: "user" | "bot";
  content: string;
  subtext?: string;
  time: string;
  isAudio?: boolean;
  isImage?: boolean;
}

const chatMessages: ChatMessage[] = [
  {
    id: 1,
    type: "user",
    content: "Gasté 15.000 en el supermercado",
    time: "10:30",
  },
  {
    id: 2,
    type: "bot",
    content: "✅ Gasto registrado: $15.000",
    subtext: "Categoría: Alimentación 🛒",
    time: "10:30",
  },
  {
    id: 3,
    type: "user",
    content: "🎤 Audio: \"Recibí 200 mil de un cliente hoy\"",
    time: "10:31",
    isAudio: true,
  },
  {
    id: 4,
    type: "bot",
    content: "✅ Ingreso registrado: $200.000",
    subtext: "Categoría: Cliente 💼",
    time: "10:31",
  },
  {
    id: 5,
    type: "user",
    content: "📷 Foto de boleta",
    time: "10:32",
    isImage: true,
  },
  {
    id: 6,
    type: "bot",
    content: "✅ Gasto registrado: $8.500",
    subtext: "Tienda: Farmacia Cruz Verde 💊",
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
    subtext: "Gastos: $523.500 | Ingresos: $850.000\nBalance: +$326.500 💰",
    time: "10:33",
  },
];

export const AnimatedChatDemo = () => {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

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
  }, [currentMessageIndex, isPlaying]);

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
