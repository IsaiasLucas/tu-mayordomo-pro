// Configuración de fecha y hora para Chile/Santiago
import { es } from 'date-fns/locale';
import { parseISO, isValid } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

// Timezone para Chile/Santiago
export const CHILE_TIMEZONE = 'America/Santiago';

// Locale en español chileno
export const chileLocale = es;

// Función para obtener la fecha actual en hora de Santiago
export const getCurrentDateInSantiago = (): Date => {
  const now = new Date();
  const santiagoNow = toZonedTime(now, CHILE_TIMEZONE);
  
  console.log('🕐 getCurrentDateInSantiago:', {
    nowUTC: now.toISOString(),
    santiagoISO: formatInTimeZone(now, CHILE_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    month: santiagoNow.getMonth() + 1,
    year: santiagoNow.getFullYear()
  });
  
  return santiagoNow;
};

// Función para formatear fecha en hora de Santiago
export const formatDateInSantiago = (date: Date): string => {
  return new Date(date.toLocaleString('en-US', { timeZone: CHILE_TIMEZONE })).toISOString();
};

// Opciones de formato para Chile
export const chileDateOptions: Intl.DateTimeFormatOptions = {
  timeZone: CHILE_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
};

// Formato estándar para mostrar fechas basado SIEMPRE en America/Santiago
export const formatDisplayInSantiago = (
  date: string | Date,
  pattern: string = "dd/MM HH:mm"
): string => {
  try {
    let d: Date;

    if (typeof date === 'string') {
      const raw = date.trim();
      const hasTZ = /[zZ]|[+-]\d{2}:?\d{2}/.test(raw);
      const hasT = /T/.test(raw);

      if (!hasTZ) {
        const normalized = hasT ? raw : raw.replace(' ', 'T');
        d = fromZonedTime(normalized, CHILE_TIMEZONE);
      } else {
        const parsed = parseISO(raw);
        d = isValid(parsed) ? parsed : new Date(raw);
      }
    } else {
      d = date;
    }

    // Usamos Intl para evitar qualquer desvio indesejado
    const parts = new Intl.DateTimeFormat('es-CL', {
      timeZone: CHILE_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(d);

    const get = (type: string) => parts.find(p => p.type === type)?.value || '';
    const dd = get('day');
    const MM = get('month');
    const HH = get('hour');
    const mm = get('minute');

    if (pattern === "dd/MM HH:mm") {
      return `${dd}/${MM} ${HH}:${mm}`;
    }

    // Para outros padrões, fallback ao formatInTimeZone
    return formatInTimeZone(d, CHILE_TIMEZONE, pattern);
  } catch (e) {
    console.warn('formatDisplayInSantiago fallback for value:', date, e);
    return String(date);
  }
};

// Convierte 'YYYY-MM' a rango UTC exacto basado en America/Santiago
export const monthRangeUTCFromSantiago = (ym: string) => {
  const [yStr, mStr] = ym.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const lastDay = new Date(year, month, 0).getDate();

  const startISO = fromZonedTime(`${ym}-01T00:00:00`, CHILE_TIMEZONE).toISOString();
  const endISO = fromZonedTime(`${ym}-${String(lastDay).padStart(2, '0')}T23:59:59`, CHILE_TIMEZONE).toISOString();

  return { startISO, endISO };
};
