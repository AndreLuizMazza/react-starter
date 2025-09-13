// Utilidades robustas para datas (lida bem com 'YYYY-MM-DD' vindo como UTC)

/** Converte string/Date em Date local "fixa" (evita voltar 1 dia em alguns browsers) */
export function safeYmd(d) {
  if (!d) return null;
  const dt = new Date(d);
  const fixed = new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
  return isNaN(fixed) ? null : fixed;
}

export function isSameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonthDay(a, b) {
  return a && b && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function fmtBR(d) {
  return d ? d.toLocaleDateString('pt-BR') : '—';
}
