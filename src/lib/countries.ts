export interface PhoneFormat {
  countryCode: string;
  digitCount: number; // Total digits including country code
  format: (digits: string) => string;
  validate: (digits: string) => boolean;
  placeholder: string;
  mask: string;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  locale: string;
  phone: PhoneFormat;
}

// Phone format configurations for each country
const PHONE_FORMATS: Record<string, PhoneFormat> = {
  AR: { // Argentina: +54 11 1234-5678 or +54 9 11 1234-5678
    countryCode: '54',
    digitCount: 12, // 54 + 10 digits
    format: (digits) => {
      const phone = digits.replace(/^54/, '');
      if (phone.length <= 2) return `+54 ${phone}`;
      if (phone.length <= 6) return `+54 ${phone.substring(0, 2)} ${phone.substring(2)}`;
      return `+54 ${phone.substring(0, 2)} ${phone.substring(2, 6)}-${phone.substring(6, 10)}`;
    },
    validate: (digits) => digits.startsWith('54') && digits.length >= 12,
    placeholder: '+54 11 1234-5678',
    mask: '+54 XX XXXX-XXXX'
  },
  BO: { // Bolivia: +591 2 123-4567
    countryCode: '591',
    digitCount: 11,
    format: (digits) => {
      const phone = digits.replace(/^591/, '');
      if (phone.length <= 1) return `+591 ${phone}`;
      if (phone.length <= 4) return `+591 ${phone.substring(0, 1)} ${phone.substring(1)}`;
      return `+591 ${phone.substring(0, 1)} ${phone.substring(1, 4)}-${phone.substring(4, 8)}`;
    },
    validate: (digits) => digits.startsWith('591') && digits.length === 11,
    placeholder: '+591 2 123-4567',
    mask: '+591 X XXX-XXXX'
  },
  CL: { // Chile: +56 9 1234 5678
    countryCode: '56',
    digitCount: 11,
    format: (digits) => {
      const phone = digits.replace(/^56/, '');
      if (phone.length <= 1) return `+56 ${phone}`;
      if (phone.length <= 5) return `+56 ${phone.substring(0, 1)} ${phone.substring(1)}`;
      return `+56 ${phone.substring(0, 1)} ${phone.substring(1, 5)} ${phone.substring(5, 9)}`;
    },
    validate: (digits) => digits.startsWith('56') && digits.length === 11 && digits[2] === '9',
    placeholder: '+56 9 1234 5678',
    mask: '+56 9 XXXX XXXX'
  },
  CO: { // Colombia: +57 321 123-4567
    countryCode: '57',
    digitCount: 12,
    format: (digits) => {
      const phone = digits.replace(/^57/, '');
      if (phone.length <= 3) return `+57 ${phone}`;
      if (phone.length <= 6) return `+57 ${phone.substring(0, 3)} ${phone.substring(3)}`;
      return `+57 ${phone.substring(0, 3)} ${phone.substring(3, 6)}-${phone.substring(6, 10)}`;
    },
    validate: (digits) => digits.startsWith('57') && digits.length === 12,
    placeholder: '+57 321 123-4567',
    mask: '+57 XXX XXX-XXXX'
  },
  CR: { // Costa Rica: +506 1234-5678
    countryCode: '506',
    digitCount: 11,
    format: (digits) => {
      const phone = digits.replace(/^506/, '');
      if (phone.length <= 4) return `+506 ${phone}`;
      return `+506 ${phone.substring(0, 4)}-${phone.substring(4, 8)}`;
    },
    validate: (digits) => digits.startsWith('506') && digits.length === 11,
    placeholder: '+506 1234-5678',
    mask: '+506 XXXX-XXXX'
  },
  CU: { // Cuba: +53 5 123-4567
    countryCode: '53',
    digitCount: 10,
    format: (digits) => {
      const phone = digits.replace(/^53/, '');
      if (phone.length <= 1) return `+53 ${phone}`;
      if (phone.length <= 4) return `+53 ${phone.substring(0, 1)} ${phone.substring(1)}`;
      return `+53 ${phone.substring(0, 1)} ${phone.substring(1, 4)}-${phone.substring(4, 8)}`;
    },
    validate: (digits) => digits.startsWith('53') && digits.length === 10,
    placeholder: '+53 5 123-4567',
    mask: '+53 X XXX-XXXX'
  },
  EC: { // Ecuador: +593 99 123-4567
    countryCode: '593',
    digitCount: 12,
    format: (digits) => {
      const phone = digits.replace(/^593/, '');
      if (phone.length <= 2) return `+593 ${phone}`;
      if (phone.length <= 5) return `+593 ${phone.substring(0, 2)} ${phone.substring(2)}`;
      return `+593 ${phone.substring(0, 2)} ${phone.substring(2, 5)}-${phone.substring(5, 9)}`;
    },
    validate: (digits) => digits.startsWith('593') && digits.length === 12,
    placeholder: '+593 99 123-4567',
    mask: '+593 XX XXX-XXXX'
  },
  SV: { // El Salvador: +503 1234-5678
    countryCode: '503',
    digitCount: 11,
    format: (digits) => {
      const phone = digits.replace(/^503/, '');
      if (phone.length <= 4) return `+503 ${phone}`;
      return `+503 ${phone.substring(0, 4)}-${phone.substring(4, 8)}`;
    },
    validate: (digits) => digits.startsWith('503') && digits.length === 11,
    placeholder: '+503 1234-5678',
    mask: '+503 XXXX-XXXX'
  },
  ES: { // España: +34 612 34 56 78
    countryCode: '34',
    digitCount: 11,
    format: (digits) => {
      const phone = digits.replace(/^34/, '');
      if (phone.length <= 3) return `+34 ${phone}`;
      if (phone.length <= 5) return `+34 ${phone.substring(0, 3)} ${phone.substring(3)}`;
      if (phone.length <= 7) return `+34 ${phone.substring(0, 3)} ${phone.substring(3, 5)} ${phone.substring(5)}`;
      return `+34 ${phone.substring(0, 3)} ${phone.substring(3, 5)} ${phone.substring(5, 7)} ${phone.substring(7, 9)}`;
    },
    validate: (digits) => digits.startsWith('34') && digits.length === 11,
    placeholder: '+34 612 34 56 78',
    mask: '+34 XXX XX XX XX'
  },
  GT: { // Guatemala: +502 1234-5678
    countryCode: '502',
    digitCount: 11,
    format: (digits) => {
      const phone = digits.replace(/^502/, '');
      if (phone.length <= 4) return `+502 ${phone}`;
      return `+502 ${phone.substring(0, 4)}-${phone.substring(4, 8)}`;
    },
    validate: (digits) => digits.startsWith('502') && digits.length === 11,
    placeholder: '+502 1234-5678',
    mask: '+502 XXXX-XXXX'
  },
  HN: { // Honduras: +504 1234-5678
    countryCode: '504',
    digitCount: 11,
    format: (digits) => {
      const phone = digits.replace(/^504/, '');
      if (phone.length <= 4) return `+504 ${phone}`;
      return `+504 ${phone.substring(0, 4)}-${phone.substring(4, 8)}`;
    },
    validate: (digits) => digits.startsWith('504') && digits.length === 11,
    placeholder: '+504 1234-5678',
    mask: '+504 XXXX-XXXX'
  },
  MX: { // México: +52 55 1234-5678
    countryCode: '52',
    digitCount: 12,
    format: (digits) => {
      const phone = digits.replace(/^52/, '');
      if (phone.length <= 2) return `+52 ${phone}`;
      if (phone.length <= 6) return `+52 ${phone.substring(0, 2)} ${phone.substring(2)}`;
      return `+52 ${phone.substring(0, 2)} ${phone.substring(2, 6)}-${phone.substring(6, 10)}`;
    },
    validate: (digits) => digits.startsWith('52') && digits.length === 12,
    placeholder: '+52 55 1234-5678',
    mask: '+52 XX XXXX-XXXX'
  },
  NI: { // Nicaragua: +505 1234-5678
    countryCode: '505',
    digitCount: 11,
    format: (digits) => {
      const phone = digits.replace(/^505/, '');
      if (phone.length <= 4) return `+505 ${phone}`;
      return `+505 ${phone.substring(0, 4)}-${phone.substring(4, 8)}`;
    },
    validate: (digits) => digits.startsWith('505') && digits.length === 11,
    placeholder: '+505 1234-5678',
    mask: '+505 XXXX-XXXX'
  },
  PA: { // Panamá: +507 1234-5678
    countryCode: '507',
    digitCount: 11,
    format: (digits) => {
      const phone = digits.replace(/^507/, '');
      if (phone.length <= 4) return `+507 ${phone}`;
      return `+507 ${phone.substring(0, 4)}-${phone.substring(4, 8)}`;
    },
    validate: (digits) => digits.startsWith('507') && digits.length === 11,
    placeholder: '+507 1234-5678',
    mask: '+507 XXXX-XXXX'
  },
  PY: { // Paraguay: +595 981 123-456
    countryCode: '595',
    digitCount: 12,
    format: (digits) => {
      const phone = digits.replace(/^595/, '');
      if (phone.length <= 3) return `+595 ${phone}`;
      if (phone.length <= 6) return `+595 ${phone.substring(0, 3)} ${phone.substring(3)}`;
      return `+595 ${phone.substring(0, 3)} ${phone.substring(3, 6)}-${phone.substring(6, 9)}`;
    },
    validate: (digits) => digits.startsWith('595') && digits.length === 12,
    placeholder: '+595 981 123-456',
    mask: '+595 XXX XXX-XXX'
  },
  PE: { // Perú: +51 912 345 678
    countryCode: '51',
    digitCount: 11,
    format: (digits) => {
      const phone = digits.replace(/^51/, '');
      if (phone.length <= 3) return `+51 ${phone}`;
      if (phone.length <= 6) return `+51 ${phone.substring(0, 3)} ${phone.substring(3)}`;
      return `+51 ${phone.substring(0, 3)} ${phone.substring(3, 6)} ${phone.substring(6, 9)}`;
    },
    validate: (digits) => digits.startsWith('51') && digits.length === 11,
    placeholder: '+51 912 345 678',
    mask: '+51 XXX XXX XXX'
  },
  DO: { // República Dominicana: +1-809 123-4567
    countryCode: '1809',
    digitCount: 11,
    format: (digits) => {
      const phone = digits.replace(/^1809/, '');
      if (phone.length <= 3) return `+1-809 ${phone}`;
      return `+1-809 ${phone.substring(0, 3)}-${phone.substring(3, 7)}`;
    },
    validate: (digits) => digits.startsWith('1809') && digits.length === 11,
    placeholder: '+1-809 123-4567',
    mask: '+1-809 XXX-XXXX'
  },
  UY: { // Uruguay: +598 91 123 456
    countryCode: '598',
    digitCount: 11,
    format: (digits) => {
      const phone = digits.replace(/^598/, '');
      if (phone.length <= 2) return `+598 ${phone}`;
      if (phone.length <= 5) return `+598 ${phone.substring(0, 2)} ${phone.substring(2)}`;
      return `+598 ${phone.substring(0, 2)} ${phone.substring(2, 5)} ${phone.substring(5, 8)}`;
    },
    validate: (digits) => digits.startsWith('598') && digits.length === 11,
    placeholder: '+598 91 123 456',
    mask: '+598 XX XXX XXX'
  },
  VE: { // Venezuela: +58 412 123-4567
    countryCode: '58',
    digitCount: 12,
    format: (digits) => {
      const phone = digits.replace(/^58/, '');
      if (phone.length <= 3) return `+58 ${phone}`;
      if (phone.length <= 6) return `+58 ${phone.substring(0, 3)} ${phone.substring(3)}`;
      return `+58 ${phone.substring(0, 3)} ${phone.substring(3, 6)}-${phone.substring(6, 10)}`;
    },
    validate: (digits) => digits.startsWith('58') && digits.length === 12,
    placeholder: '+58 412 123-4567',
    mask: '+58 XXX XXX-XXXX'
  },
  US: { // USA: +1 (555) 123-4567
    countryCode: '1',
    digitCount: 11,
    format: (digits) => {
      const phone = digits.replace(/^1/, '');
      if (phone.length <= 3) return `+1 (${phone}`;
      if (phone.length <= 6) return `+1 (${phone.substring(0, 3)}) ${phone.substring(3)}`;
      return `+1 (${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6, 10)}`;
    },
    validate: (digits) => digits.startsWith('1') && digits.length === 11,
    placeholder: '+1 (555) 123-4567',
    mask: '+1 (XXX) XXX-XXXX'
  },
};

export const COUNTRIES: Country[] = [
  { code: 'AR', name: 'Argentina', currency: 'ARS', locale: 'es-AR', phone: PHONE_FORMATS.AR },
  { code: 'BO', name: 'Bolivia', currency: 'BOB', locale: 'es-BO', phone: PHONE_FORMATS.BO },
  { code: 'CL', name: 'Chile', currency: 'CLP', locale: 'es-CL', phone: PHONE_FORMATS.CL },
  { code: 'CO', name: 'Colombia', currency: 'COP', locale: 'es-CO', phone: PHONE_FORMATS.CO },
  { code: 'CR', name: 'Costa Rica', currency: 'CRC', locale: 'es-CR', phone: PHONE_FORMATS.CR },
  { code: 'CU', name: 'Cuba', currency: 'CUP', locale: 'es-CU', phone: PHONE_FORMATS.CU },
  { code: 'EC', name: 'Ecuador', currency: 'USD', locale: 'es-EC', phone: PHONE_FORMATS.EC },
  { code: 'SV', name: 'El Salvador', currency: 'USD', locale: 'es-SV', phone: PHONE_FORMATS.SV },
  { code: 'ES', name: 'España', currency: 'EUR', locale: 'es-ES', phone: PHONE_FORMATS.ES },
  { code: 'GT', name: 'Guatemala', currency: 'GTQ', locale: 'es-GT', phone: PHONE_FORMATS.GT },
  { code: 'HN', name: 'Honduras', currency: 'HNL', locale: 'es-HN', phone: PHONE_FORMATS.HN },
  { code: 'MX', name: 'México', currency: 'MXN', locale: 'es-MX', phone: PHONE_FORMATS.MX },
  { code: 'NI', name: 'Nicaragua', currency: 'NIO', locale: 'es-NI', phone: PHONE_FORMATS.NI },
  { code: 'PA', name: 'Panamá', currency: 'USD', locale: 'es-PA', phone: PHONE_FORMATS.PA },
  { code: 'PY', name: 'Paraguay', currency: 'PYG', locale: 'es-PY', phone: PHONE_FORMATS.PY },
  { code: 'PE', name: 'Perú', currency: 'PEN', locale: 'es-PE', phone: PHONE_FORMATS.PE },
  { code: 'DO', name: 'República Dominicana', currency: 'DOP', locale: 'es-DO', phone: PHONE_FORMATS.DO },
  { code: 'UY', name: 'Uruguay', currency: 'UYU', locale: 'es-UY', phone: PHONE_FORMATS.UY },
  { code: 'VE', name: 'Venezuela', currency: 'VES', locale: 'es-VE', phone: PHONE_FORMATS.VE },
  { code: 'US', name: 'Estados Unidos', currency: 'USD', locale: 'en-US', phone: PHONE_FORMATS.US },
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

export function formatPhoneNumber(value: string, countryCode: string): string {
  const country = getCountryByCode(countryCode);
  if (!country) return value;

  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Remove country code if present
  let phone = digits;
  if (phone.startsWith(country.phone.countryCode)) {
    phone = phone.substring(country.phone.countryCode.length);
  }
  
  // Add country code back and format
  const fullNumber = country.phone.countryCode + phone;
  return country.phone.format(fullNumber);
}

export function validatePhoneNumber(value: string, countryCode: string): boolean {
  const country = getCountryByCode(countryCode);
  if (!country) return false;

  const digits = value.replace(/\D/g, '');
  return country.phone.validate(digits);
}

export function getPhoneFormat(countryCode: string): PhoneFormat | undefined {
  const country = getCountryByCode(countryCode);
  return country?.phone;
}
