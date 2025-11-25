import { COUNTRIES } from './countries';

/**
 * Detecta o país do usuário baseado em preferências do navegador
 * Usa locale, timezone e opcionalmente IP geolocation
 */

// Mapeamento de timezones para países
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'America/Argentina/Buenos_Aires': 'AR',
  'America/Argentina/Cordoba': 'AR',
  'America/La_Paz': 'BO',
  'America/Santiago': 'CL',
  'America/Bogota': 'CO',
  'America/Costa_Rica': 'CR',
  'America/Havana': 'CU',
  'America/Guayaquil': 'EC',
  'America/El_Salvador': 'SV',
  'Europe/Madrid': 'ES',
  'America/Guatemala': 'GT',
  'America/Tegucigalpa': 'HN',
  'America/Mexico_City': 'MX',
  'America/Managua': 'NI',
  'America/Panama': 'PA',
  'America/Asuncion': 'PY',
  'America/Lima': 'PE',
  'America/Santo_Domingo': 'DO',
  'America/Montevideo': 'UY',
  'America/Caracas': 'VE',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
};

// Mapeamento de códigos de idioma para países (fallback)
const LOCALE_TO_COUNTRY: Record<string, string> = {
  'es-AR': 'AR',
  'es-BO': 'BO',
  'es-CL': 'CL',
  'es-CO': 'CO',
  'es-CR': 'CR',
  'es-CU': 'CU',
  'es-EC': 'EC',
  'es-SV': 'SV',
  'es-ES': 'ES',
  'es-GT': 'GT',
  'es-HN': 'HN',
  'es-MX': 'MX',
  'es-NI': 'NI',
  'es-PA': 'PA',
  'es-PY': 'PY',
  'es-PE': 'PE',
  'es-DO': 'DO',
  'es-UY': 'UY',
  'es-VE': 'VE',
  'en-US': 'US',
  'en': 'US',
};

/**
 * Detecta o país baseado no timezone do navegador
 */
function detectFromTimezone(): string | null {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_TO_COUNTRY[timezone] || null;
  } catch {
    return null;
  }
}

/**
 * Detecta o país baseado no locale do navegador
 */
function detectFromLocale(): string | null {
  try {
    const locale = navigator.language || (navigator as any).userLanguage;
    if (!locale) return null;

    // Tenta match exato primeiro (es-CL)
    if (LOCALE_TO_COUNTRY[locale]) {
      return LOCALE_TO_COUNTRY[locale];
    }

    // Tenta match apenas com o país (CL de es-CL)
    const parts = locale.split('-');
    if (parts.length === 2) {
      const countryCode = parts[1].toUpperCase();
      const country = COUNTRIES.find(c => c.code === countryCode);
      if (country) return countryCode;
    }

    // Tenta match apenas com o idioma base (es)
    const langCode = parts[0];
    if (LOCALE_TO_COUNTRY[langCode]) {
      return LOCALE_TO_COUNTRY[langCode];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Detecta o país usando IP geolocation (serviço gratuito)
 * Nota: Esta função é assíncrona e pode falhar em alguns casos
 */
async function detectFromIP(): Promise<string | null> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000), // 3 segundos de timeout
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const countryCode = data.country_code;
    
    // Verifica se o país está na nossa lista
    const country = COUNTRIES.find(c => c.code === countryCode);
    return country ? countryCode : null;
  } catch {
    return null;
  }
}

/**
 * Detecta automaticamente o país do usuário
 * Usa múltiplas estratégias em ordem de prioridade:
 * 1. IP Geolocation (mais preciso, mas requer internet)
 * 2. Timezone (preciso para países com timezone único)
 * 3. Locale do navegador (menos preciso, mas sempre disponível)
 * 
 * @param useIPGeolocation - Se deve tentar usar IP geolocation (padrão: true)
 * @returns Código do país detectado ou 'CL' como fallback
 */
export async function detectUserCountry(useIPGeolocation: boolean = true): Promise<string> {
  // Tenta IP geolocation primeiro (mais preciso)
  if (useIPGeolocation) {
    const ipCountry = await detectFromIP();
    if (ipCountry) {
      console.log('[CountryDetection] Detected from IP:', ipCountry);
      return ipCountry;
    }
  }

  // Tenta timezone
  const timezoneCountry = detectFromTimezone();
  if (timezoneCountry) {
    console.log('[CountryDetection] Detected from timezone:', timezoneCountry);
    return timezoneCountry;
  }

  // Tenta locale
  const localeCountry = detectFromLocale();
  if (localeCountry) {
    console.log('[CountryDetection] Detected from locale:', localeCountry);
    return localeCountry;
  }

  // Fallback para Chile
  console.log('[CountryDetection] Using fallback: CL');
  return 'CL';
}

/**
 * Versão síncrona da detecção (sem IP geolocation)
 * Útil para casos onde não se pode usar async/await
 */
export function detectUserCountrySync(): string {
  const timezoneCountry = detectFromTimezone();
  if (timezoneCountry) {
    console.log('[CountryDetection] Detected from timezone:', timezoneCountry);
    return timezoneCountry;
  }

  const localeCountry = detectFromLocale();
  if (localeCountry) {
    console.log('[CountryDetection] Detected from locale:', localeCountry);
    return localeCountry;
  }

  console.log('[CountryDetection] Using fallback: CL');
  return 'CL';
}
