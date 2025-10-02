import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if prompt was already dismissed
    const promptDismissed = localStorage.getItem('pwa-prompt-dismissed');
    
    if (!isInStandaloneMode && !promptDismissed) {
      if (ios) {
        // For iOS, show manual instructions after a delay
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      } else {
        // For Android/Chrome, listen for beforeinstallprompt
        const handler = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e as BeforeInstallPromptEvent);
          setShowPrompt(true);
        };
        
        window.addEventListener('beforeinstallprompt', handler);
        
        return () => {
          window.removeEventListener('beforeinstallprompt', handler);
        };
      }
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in md:left-auto md:right-4 md:max-w-md">
      <Card className="p-4 shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-card to-card/95 backdrop-blur-xl">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl flex-shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-base mb-1">
              ¡Instala Tu Mayordomo!
            </h3>
            
            {isIOS ? (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Para instalar en iOS:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Toca el botón compartir <span className="inline-block">📤</span></li>
                  <li>Selecciona "Añadir a inicio"</li>
                  <li>Confirma tocando "Añadir"</li>
                </ol>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  Accede más rápido y sin conexión desde tu pantalla de inicio
                </p>
                <Button
                  onClick={handleInstall}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Instalar Aplicación
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}