export interface Country {
  code: string;
  name: string;
  currency: string;
  locale: string;
}

export const COUNTRIES: Country[] = [
  { code: 'AR', name: 'Argentina', currency: 'ARS', locale: 'es-AR' },
  { code: 'BO', name: 'Bolivia', currency: 'BOB', locale: 'es-BO' },
  { code: 'CL', name: 'Chile', currency: 'CLP', locale: 'es-CL' },
  { code: 'CO', name: 'Colombia', currency: 'COP', locale: 'es-CO' },
  { code: 'CR', name: 'Costa Rica', currency: 'CRC', locale: 'es-CR' },
  { code: 'CU', name: 'Cuba', currency: 'CUP', locale: 'es-CU' },
  { code: 'EC', name: 'Ecuador', currency: 'USD', locale: 'es-EC' },
  { code: 'SV', name: 'El Salvador', currency: 'USD', locale: 'es-SV' },
  { code: 'ES', name: 'España', currency: 'EUR', locale: 'es-ES' },
  { code: 'GT', name: 'Guatemala', currency: 'GTQ', locale: 'es-GT' },
  { code: 'HN', name: 'Honduras', currency: 'HNL', locale: 'es-HN' },
  { code: 'MX', name: 'México', currency: 'MXN', locale: 'es-MX' },
  { code: 'NI', name: 'Nicaragua', currency: 'NIO', locale: 'es-NI' },
  { code: 'PA', name: 'Panamá', currency: 'USD', locale: 'es-PA' },
  { code: 'PY', name: 'Paraguay', currency: 'PYG', locale: 'es-PY' },
  { code: 'PE', name: 'Perú', currency: 'PEN', locale: 'es-PE' },
  { code: 'DO', name: 'República Dominicana', currency: 'DOP', locale: 'es-DO' },
  { code: 'UY', name: 'Uruguay', currency: 'UYU', locale: 'es-UY' },
  { code: 'VE', name: 'Venezuela', currency: 'VES', locale: 'es-VE' },
  { code: 'US', name: 'Estados Unidos', currency: 'USD', locale: 'en-US' },
];

export const CURRENCIES = {
  ARS: { symbol: '$', name: 'Peso Argentino', decimals: 2 },
  BOB: { symbol: 'Bs', name: 'Boliviano', decimals: 2 },
  CLP: { symbol: '$', name: 'Peso Chileno', decimals: 0 },
  COP: { symbol: '$', name: 'Peso Colombiano', decimals: 0 },
  CRC: { symbol: '₡', name: 'Colón Costarricense', decimals: 0 },
  CUP: { symbol: '$', name: 'Peso Cubano', decimals: 2 },
  USD: { symbol: '$', name: 'Dólar', decimals: 2 },
  EUR: { symbol: '€', name: 'Euro', decimals: 2 },
  GTQ: { symbol: 'Q', name: 'Quetzal', decimals: 2 },
  HNL: { symbol: 'L', name: 'Lempira', decimals: 2 },
  MXN: { symbol: '$', name: 'Peso Mexicano', decimals: 2 },
  NIO: { symbol: 'C$', name: 'Córdoba', decimals: 2 },
  PYG: { symbol: '₲', name: 'Guaraní', decimals: 0 },
  PEN: { symbol: 'S/', name: 'Sol', decimals: 2 },
  DOP: { symbol: 'RD$', name: 'Peso Dominicano', decimals: 2 },
  UYU: { symbol: '$U', name: 'Peso Uruguayo', decimals: 2 },
  VES: { symbol: 'Bs.S', name: 'Bolívar', decimals: 2 },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'CLP', locale: string = 'es-CL'): string {
  const currency = CURRENCIES[currencyCode];
  if (!currency) return amount.toString();

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount);
}

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function getCurrencyInfo(code: CurrencyCode) {
  return CURRENCIES[code];
}
