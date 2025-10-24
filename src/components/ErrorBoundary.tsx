import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { errorTracker } from '@/lib/errorTracking';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error silently with errorTracker
    errorTracker.error('React error boundary caught error', error, 'ErrorBoundary');
    
    // Ensure scroll is not locked after error
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.position = '';
    
    // Log to sessionStorage for debugging (non-intrusive)
    try {
      const errorLog = {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      };
      sessionStorage.setItem('last_error', JSON.stringify(errorLog));
    } catch (e) {
      // Silently fail if logging fails
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Ensure scroll is not locked before reload
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.position = '';
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4" style={{ overflow: 'auto' }}>
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-destructive/10 rounded-full p-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                Algo salió mal
              </h2>
              <p className="text-sm text-muted-foreground">
                La aplicación encontró un error inesperado. No te preocupes, tus datos están seguros.
              </p>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Detalles técnicos
                </summary>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <Button 
              onClick={this.handleReset}
              className="w-full rounded-xl"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
