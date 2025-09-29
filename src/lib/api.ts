// N8N/Sheets API Integration
const API_BASE = import.meta.env.VITE_N8N_API_BASE || '';

interface UserData {
  plan: string;
  usage_count: number;
  usage_month: number;
}

interface Gasto {
  id: string;
  fecha: string;
  categoria: string;
  tipo: 'ingreso' | 'gasto';
  valor: number;
  detalles: string;
}

interface Reporte {
  periodo: string;
  tipo: string;
  pdf_url: string;
}

interface StripeCheckout {
  url: string;
}

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // GET /user?tel={tel} → { plan, usage_count, usage_month }
  async getUser(tel: string): Promise<UserData> {
    return this.fetchApi<UserData>(`/user?tel=${encodeURIComponent(tel)}`);
  }

  // GET /gastos?tel={tel}&mes={yyyy-mm} → [{ id, fecha, categoria, tipo, valor, detalles }]
  async getGastos(tel: string, mes: string): Promise<Gasto[]> {
    return this.fetchApi<Gasto[]>(`/gastos?tel=${encodeURIComponent(tel)}&mes=${mes}`);
  }

  // GET /reportes?tel={tel} → [{ periodo, tipo, pdf_url }]
  async getReportes(tel: string): Promise<Reporte[]> {
    return this.fetchApi<Reporte[]>(`/reportes?tel=${encodeURIComponent(tel)}`);
  }

  // POST /pdf?tel={tel}&tipo=semanal|mensual
  async generatePdf(tel: string, tipo: 'semanal' | 'mensual'): Promise<void> {
    return this.fetchApi<void>(`/pdf?tel=${encodeURIComponent(tel)}&tipo=${tipo}`, {
      method: 'POST',
    });
  }

  // POST /stripe/checkout { plan } → { url }
  async createStripeCheckout(plan: string): Promise<StripeCheckout> {
    return this.fetchApi<StripeCheckout>('/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  }
}

export const apiService = new ApiService();
export type { UserData, Gasto, Reporte, StripeCheckout };