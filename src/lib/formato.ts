import type { EstadoIncidencia, EstadoPedido, LineaPedido, MetodoPago, OrigenIncidencia, TipoIncidencia } from "@/lib/api/tipos";

const ZONA = "Europe/Madrid";

/** "Jueves 6 de noviembre de 2026" (o sin el año: "Jueves 6 de noviembre") */
export function fechaLarga(fecha: Date, { conAnio = true } = {}): string {
  const texto = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: conAnio ? "numeric" : undefined, timeZone: ZONA })
    .format(fecha)
    .replace(",", "");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const formatoEuros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

/** 15.9 → "15,90 €" */
export function euros(importe: number): string {
  return formatoEuros.format(importe);
}

/** "2× Hamburguesa clásica · 1× Patatas fritas" */
export function resumenLineas(lineas: LineaPedido[]): string {
  return lineas.map((l) => `${l.cantidad}× ${l.nombreProducto}`).join(" · ");
}

export const TEXTO_ESTADO_PEDIDO: Record<EstadoPedido, string> = {
  RECIBIDO: "Recibido",
  EN_PREPARACION: "Preparando",
  LISTO: "Listo",
  EN_REPARTO: "En reparto",
  ENTREGADO: "Entregado",
  RECHAZADO: "Rechazado",
  CANCELADO: "Cancelado",
};

export const TEXTO_METODO_PAGO: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta",
};

const dia = (fecha: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(fecha);

/** "Hoy, 13:10", "Ayer, 21:15" o "3 nov, 20:05" */
export function fechaRelativa(iso: string, ahora = new Date()): string {
  const fecha = new Date(iso);
  const hora = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: ZONA }).format(fecha);
  const ayer = new Date(ahora);
  ayer.setDate(ayer.getDate() - 1);
  if (dia(fecha) === dia(ahora)) return `Hoy, ${hora}`;
  if (dia(fecha) === dia(ayer)) return `Ayer, ${hora}`;
  const corta = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: ZONA }).format(fecha).replace(".", "");
  return `${corta}, ${hora}`;
}

/** Solo la hora: "13:10" */
export function hora(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: ZONA }).format(new Date(iso));
}

export const TEXTO_TIPO_INCIDENCIA: Record<TipoIncidencia, string> = {
  FALTA_PRODUCTO: "Falta un producto",
  RETRASO: "Retraso",
  PRODUCTO_MAL_ESTADO: "Producto en mal estado",
  CLIENTE_AUSENTE: "Cliente ausente",
  DIRECCION_INCORRECTA: "Dirección incorrecta",
  OTRA: "Otra",
};

export const TEXTO_ORIGEN_INCIDENCIA: Record<OrigenIncidencia, string> = {
  CLIENTE: "Cliente",
  REPARTIDOR: "Repartidor",
};

export const TEXTO_ESTADO_INCIDENCIA: Record<EstadoIncidencia, string> = {
  ABIERTA: "Abierta",
  RESPONDIDA: "Respondida",
  RESUELTA: "Resuelta",
};

/** "DF-001036" → "#1036", como en el prototipo. */
export function codigoCorto(codigo: string): string {
  const numero = codigo.replace(/^DF-0*/, "");
  return `#${numero.padStart(4, "0")}`;
}

/** Iniciales para el avatar: "Carlos Morán" → "CM". */
export function iniciales(nombre: string): string {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
}

/** "1 negocio" / "13 negocios" */
export function plural(n: number, singular: string, pluralTexto = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}

/** Importe escrito a mano: "12,5" o "12.50" → 12.5; NaN si no es un importe válido. */
export function leerImporte(texto: string): number {
  return /^\d+([.,]\d{1,2})?$/.test(texto.trim()) ? Number(texto.trim().replace(",", ".")) : NaN;
}

/** Importe para un campo editable: 1.5 → "1,50". */
export function importeEditable(importe: number): string {
  return importe.toFixed(2).replace(".", ",");
}
