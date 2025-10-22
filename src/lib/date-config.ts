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

// Formato para exibir a data EXATAMENTE como está no banco (sem conversão)
export const formatDatabaseDate = (
  date: string | Date,
  pattern: string = "dd/MM HH:mm"
): string => {
  try {
    let d: Date;

    if (typeof date === 'string') {
      // Parse a data diretamente sem conversão de timezone
      d = new Date(date);
    } else {
      d = date;
    }

    if (!isValid(d)) {
      console.warn('formatDatabaseDate: invalid date', date);
      return String(date);
    }

    // Formatar usando UTC para manter fidelidade com o banco
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');

    if (pattern === "dd/MM HH:mm") {
      return `${day}/${month} ${hours}:${minutes}`;
    }

    if (pattern === "dd/MM/yyyy HH:mm") {
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    if (pattern === "HH:mm") {
      return `${hours}:${minutes}`;
    }

    if (pattern.includes("MMMM")) {
      // Para padrões com nome do mês, usar date-fns com UTC
      const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                         'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      const monthName = monthNames[d.getUTCMonth()];
      return pattern
        .replace('dd', day)
        .replace('MMMM', monthName)
        .replace('yyyy', String(year));
    }

    // Fallback genérico
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (e) {
    console.warn('formatDatabaseDate error:', date, e);
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
