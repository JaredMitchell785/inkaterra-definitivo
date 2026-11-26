// Funciones para mostrar fechas y montos como en el diseño
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const dos = (n) => String(n).padStart(2, '0');

export const hora = (iso) => {
  const f = new Date(iso);
  return `${dos(f.getHours())}:${dos(f.getMinutes())}`;
};

// 05 oct 2026
export const fechaCorta = (iso) => {
  const f = new Date(iso);
  return `${dos(f.getDate())} ${MESES[f.getMonth()]} ${f.getFullYear()}`;
};

// 05/10/2026
export const fechaNumerica = (iso) => {
  const f = new Date(iso);
  return `${dos(f.getDate())}/${dos(f.getMonth() + 1)}/${f.getFullYear()}`;
};

export const fechaHora = (iso) => `${fechaNumerica(iso)} · ${hora(iso)}`;

export const esHoy = (iso) => new Date(iso).toDateString() === new Date().toDateString();

// "Hoy, 09:42", "Ayer, 16:20" o "05/10/2026, 09:42"
export const fechaRelativa = (iso) => {
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  if (esHoy(iso)) return `Hoy, ${hora(iso)}`;
  if (new Date(iso).toDateString() === ayer.toDateString()) return `Ayer, ${hora(iso)}`;
  return `${fechaNumerica(iso)}, ${hora(iso)}`;
};

export const soles = (monto) =>
  `S/ ${monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const plural = (n, palabra) => `${n} ${palabra}${n === 1 ? '' : 's'}`;

// Cuántos documentos tienen hoy un evento de cierto tipo
export const contarHoy = (documentos, tipo) =>
  documentos.filter((d) => d.historial.some((e) => e.tipo === tipo && esHoy(e.fecha))).length;
