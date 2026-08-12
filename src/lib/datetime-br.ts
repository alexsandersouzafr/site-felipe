import { format, isValid, parse, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const DATETIME_BR_DISPLAY = "dd/MM/yyyy HH:mm";
export const DATETIME_LOCAL_VALUE = "yyyy-MM-dd'T'HH:mm";

export function formatDateTimeBr(date: Date) {
  return format(date, DATETIME_BR_DISPLAY, { locale: ptBR });
}

export function formatDateTimeLocal(date: Date) {
  return format(date, DATETIME_LOCAL_VALUE);
}

export function formatMonthCaption(date: Date) {
  return format(date, "LLLL yyyy", { locale: ptBR });
}

export function formatWeekdayLabel(date: Date) {
  return format(date, "EEEEEE", { locale: ptBR });
}

export function parseDateTimeLocal(
  value: string | null | undefined,
): Date | null {
  if (!value?.trim()) {
    return null;
  }

  const fromLocal = parse(value, DATETIME_LOCAL_VALUE, new Date());
  if (isValid(fromLocal)) {
    return fromLocal;
  }

  const fromIso = parseISO(value);
  return isValid(fromIso) ? fromIso : null;
}

/** Converts ISO/DB timestamps to `yyyy-MM-ddTHH:mm` for form fields. */
export function toDateTimeLocalValue(value: string | null | undefined) {
  const date = parseDateTimeLocal(value);
  return date ? formatDateTimeLocal(date) : "";
}
