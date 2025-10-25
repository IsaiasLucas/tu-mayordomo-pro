// Configuración de fecha y hora para Chile/Santiago
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';

// Configurar plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar locale en español
dayjs.locale('es');

// Define el timezone local del app
dayjs.tz.setDefault('America/Santiago');

// Timezone para Chile/Santiago
export const CHILE_TIMEZONE = 'America/Santiago';

// Helper para obtener clave del mes actual
export function getCurrentMonthKey(): string {
  const now = dayjs().tz();
  return now.format('YYYY-MM');
}

// Función para obtener la fecha actual en hora de Santiago
export function getCurrentDateInSantiago(): Date {
  const santiagoNow = dayjs().tz();
  
  console.log('🕐 getCurrentDateInSantiago:', {
    nowUTC: dayjs().utc().format(),
    santiagoISO: santiagoNow.format(),
    month: santiagoNow.month() + 1,
    year: santiagoNow.year()
  });
  
  return santiagoNow.toDate();
}

// Función para formatear fecha en hora de Santiago
export function formatDateInSantiago(date: Date): string {
  return dayjs(date).tz().toISOString();
}

// Formato para mostrar la fecha EXACTAMENTE como está en la base de datos (sin conversión)
export function formatDatabaseDate(
  date: string | Date,
  pattern: string = "dd/MM HH:mm"
): string {
  try {
    const d = dayjs(date);
    
    if (!d.isValid()) {
      console.warn('formatDatabaseDate: invalid date', date);
      return String(date);
    }

    // Mapeo de patrones a formatos de dayjs
    const formatMap: Record<string, string> = {
      "dd/MM HH:mm": "DD/MM HH:mm",
      "dd/MM/yyyy HH:mm": "DD/MM/YYYY HH:mm",
      "HH:mm": "HH:mm",
    };

    // Si el patrón incluye MMMM, usar formato de mes largo en español
    if (pattern.includes("MMMM")) {
      return d.format(pattern.replace('dd', 'DD').replace('yyyy', 'YYYY'));
    }

    const dayjsFormat = formatMap[pattern] || "DD/MM/YYYY HH:mm";
    return d.format(dayjsFormat);
  } catch (e) {
    console.warn('formatDatabaseDate error:', date, e);
    return String(date);
  }
}

// Convierte 'YYYY-MM' a rango UTC exacto basado en America/Santiago
export function monthRangeUTCFromSantiago(ym: string) {
  const [yStr, mStr] = ym.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  
  const startOfMonth = dayjs.tz(`${ym}-01 00:00:00`, CHILE_TIMEZONE);
  const endOfMonth = startOfMonth.endOf('month');

  const startISO = startOfMonth.utc().toISOString();
  const endISO = endOfMonth.utc().toISOString();

  return { startISO, endISO };
}
