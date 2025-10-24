import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

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
    console.error('ErrorBoundary caught error:', error, errorInfo);
    
    // Log to external service if needed (non-intrusive)
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
    // Clear all state and caches
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
    
    // Reset state
    this.setState({ hasError: false, error: null });
    
    // Hard redirect to auth to fully reset app
    window.location.href = '/auth';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
                La aplicación encontró un error inesperado. Por favor, intenta nuevamente.
              </p>
            </div>
            <Button 
              onClick={this.handleReset}
              className="w-full rounded-xl h-12 text-base font-semibold"
            >
              Ir al inicio de sesión
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
