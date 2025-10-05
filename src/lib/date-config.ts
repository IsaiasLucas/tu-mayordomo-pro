// Configuración de fecha y hora para Chile/Santiago
import { es } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

// Timezone para Chile/Santiago
export const CHILE_TIMEZONE = 'America/Santiago';

// Locale en español chileno
export const chileLocale = es;

// Función para obtener la fecha actual en hora de Santiago
export const getCurrentDateInSantiago = (): Date => {
  const now = new Date();
  const santiagTimeString = now.toLocaleString('en-US', { timeZone: CHILE_TIMEZONE });
  const santiagDate = new Date(santiagTimeString);
  
  console.log('🕐 getCurrentDateInSantiago:', {
    nowUTC: now.toISOString(),
    santiagTimeString,
    santiagDate: santiagDate.toISOString(),
    month: santiagDate.getMonth() + 1,
    year: santiagDate.getFullYear()
  });
  
  return santiagDate;
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
    return formatInTimeZone(new Date(date), CHILE_TIMEZONE, pattern);
  } catch (e) {
    console.warn('formatDisplayInSantiago fallback for value:', date, e);
    return String(date);
  }
};
