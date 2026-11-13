import type { EstadisticasNegocio, Periodo } from "../tipos";

/**
 * Estadísticas de ejemplo para N06. La semana son las cifras del prototipo; el día y el mes
 * siguen la misma proporción. Son fijas (no dependen de los pedidos simulados).
 */

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function rango(periodo: Periodo, fecha: Date): [Date, Date] {
  const desde = new Date(fecha);
  const hasta = new Date(fecha);
  if (periodo === "SEMANA") {
    const lunes = (fecha.getDay() + 6) % 7; // 0 = lunes
    desde.setDate(fecha.getDate() - lunes);
    hasta.setDate(desde.getDate() + 6);
  } else if (periodo === "MES") {
    desde.setDate(1);
    hasta.setMonth(fecha.getMonth() + 1, 0);
  }
  return [desde, hasta];
}

const HORAS_DIA = [3, 5, 4, 2, 0, 0, 0, 0, 4, 6, 5, 2]; // 12:00 … 23:00
const SEMANA = [18, 21, 19, 26, 34, 31, 19];

export function estadisticasSimuladas(periodo: Periodo, fechaTexto?: string | null): EstadisticasNegocio {
  const fecha = fechaTexto ? new Date(`${fechaTexto}T12:00:00`) : new Date();
  const [desde, hasta] = rango(periodo, fecha);

  let serie: EstadisticasNegocio["serie"];
  if (periodo === "DIA") serie = HORAS_DIA.map((pedidos, i) => ({ etiqueta: `${12 + i}:00`, pedidos }));
  else if (periodo === "SEMANA") serie = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((etiqueta, i) => ({ etiqueta, pedidos: SEMANA[i]! }));
  else serie = Array.from({ length: hasta.getDate() }, (_, i) => ({ etiqueta: String(i + 1), pedidos: SEMANA[(desde.getDay() + 6 + i) % 7]! + ((i * 7) % 5) - 2 }));

  const pedidos = serie.reduce((s, x) => s + x.pedidos, 0);
  const factor = pedidos / 168;
  const r = (n: number) => Math.round(n * factor);

  return {
    periodo,
    desde: iso(desde),
    hasta: iso(hasta),
    pedidos,
    pedidosAnterior: Math.round(pedidos / 1.08),
    facturacion: Math.round(2940 * factor * 100) / 100,
    facturacionAnterior: Math.round((2940 * factor * 100) / 1.05) / 100,
    tiempoMedioEntregaMin: 24,
    tiempoMedioEntregaAnteriorMin: 26,
    incidencias: periodo === "DIA" ? { total: 3, resueltas: 1, abiertas: 2 } : { total: r(3) || 3, resueltas: (r(3) || 3) - 1, abiertas: 1 },
    serie,
    masVendidos: [
      { nombre: "Hamburguesa clásica", unidades: r(64) },
      { nombre: "Menú DeliFast", unidades: r(41) },
      { nombre: "Patatas fritas", unidades: r(38) },
      { nombre: "Hamburguesa doble", unidades: r(27) },
      { nombre: "Refresco de cola", unidades: r(25) },
    ],
  };
}
