// Configuración de fecha y hora para Chile/Santiago
import { es } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

// Timezone para Chile/Santiago
export const CHILE_TIMEZONE = 'America/Santiago';

// Locale en español chileno
export const chileLocale = es;

// Función para obtener la fecha actual en hora de Santiago
export const getCurrentDateInSantiago = (): Date => {
  const now = new Date();
  const santiagDate = toZonedTime(now, CHILE_TIMEZONE);
  console.log('Santiago date:', santiagDate, 'Month:', santiagDate.getMonth() + 1);
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
