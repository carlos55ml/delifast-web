import type { CambioEstado, EstadoPedido, LineaPedido, MetodoPago, MiNegocio, PedidoNegocio, Perfil, RepartidorNegocio } from "../tipos";
import { localidades, negocios } from "./datos";

/**
 * Datos de ejemplo del panel del negocio: Hamburguesería Pepe (Osuna), con los pedidos del
 * prototipo de Figma (N01). Las horas son relativas a cuando se carga la página.
 */

const pepe = negocios.find((n) => n.nombre === "Hamburguesería Pepe")!;

export const perfilNegocio: Perfil = {
  id: pepe.dueno!.id,
  nombre: "Pepe García",
  email: pepe.dueno!.email,
  telefono: "655 112 233",
  rol: "NEGOCIO",
  negocioId: pepe.id,
  esDueno: true,
};

export const repartidores: RepartidorNegocio[] = [
  { id: "00000000-0000-4000-8000-000000000201", nombre: "Marta Díaz", email: "marta.diaz@hamburgueseriapepe.es", telefono: "622 410 118", activo: true, disponible: true, pedidosEnReparto: 0 },
  { id: "00000000-0000-4000-8000-000000000202", nombre: "Juan Torres", email: "juan.torres@hamburgueseriapepe.es", telefono: "633 902 457", activo: true, disponible: true, pedidosEnReparto: 0 },
  { id: "00000000-0000-4000-8000-000000000203", nombre: "Pedro Sanz", email: "pedro.sanz@hamburgueseriapepe.es", telefono: "644 785 230", activo: true, disponible: false, pedidosEnReparto: 0 },
  { id: "00000000-0000-4000-8000-000000000204", nombre: "Laura Gil", email: "laura.gil@hamburgueseriapepe.es", telefono: null, activo: false, disponible: false, pedidosEnReparto: 0 },
];

export const perfilRepartidor: Perfil = {
  id: repartidores[1]!.id,
  nombre: repartidores[1]!.nombre,
  email: repartidores[1]!.email,
  telefono: repartidores[1]!.telefono,
  rol: "REPARTIDOR",
  negocioId: pepe.id,
  esDueno: false,
};

export const miNegocio: MiNegocio = {
  id: pepe.id,
  nombre: pepe.nombre,
  localidad: localidades.find((l) => l.nombre === "Osuna")!,
  abierto: true,
  abiertoManual: true,
  pedidosHoy: 8, // los de antes, ya entregados; abajo se suman los del tablero
};

/** Precios de la carta de ejemplo. */
const CARTA: Record<string, number> = {
  "Menú DeliFast": 8.5,
  "Nuggets (6 uds.)": 4.2,
  "Refresco de cola": 1.7,
  "Hamburguesa clásica": 5.5,
  "Hamburguesa doble": 7.9,
  "Hamburguesa de pollo": 6.8,
  "Patatas fritas": 2.6,
  "Aros de cebolla": 3,
  "Bocadillo de lomo": 6.5,
};

export const GASTOS_ENVIO = 1.5;
const redondear = (n: number) => Math.round(n * 100) / 100;

export function lineas(...productos: [cantidad: number, nombre: string][]): LineaPedido[] {
  return productos.map(([cantidad, nombre]) => ({
    nombreProducto: nombre,
    precioUnitario: CARTA[nombre]!,
    cantidad,
    importe: redondear(CARTA[nombre]! * cantidad),
  }));
}

const haceMin = (min: number, base = Date.now()) => new Date(base - min * 60_000).toISOString();

/** Historial coherente con el estado: RECIBIDO al crear y un cambio por cada paso. */
function historial(estado: EstadoPedido, creadoHaceMin: number, cliente: string, repartidor?: string): CambioEstado[] {
  const pasos: [EstadoPedido, number, string][] = [["RECIBIDO", 0, cliente]];
  const orden: EstadoPedido[] = ["EN_PREPARACION", "LISTO", "EN_REPARTO"];
  const autores = ["Pepe García", "Ana Ruiz", repartidor ? "Pepe García" : "Ana Ruiz"];
  const hasta = orden.indexOf(estado);
  for (let i = 0; i <= hasta; i++) pasos.push([orden[i]!, Math.round(((i + 1) * creadoHaceMin) / (hasta + 2)), autores[i]!]);
  return pasos.map(([nuevo, tras, autor], i) => ({
    estadoAnterior: i === 0 ? null : pasos[i - 1]![0],
    estadoNuevo: nuevo,
    fecha: haceMin(creadoHaceMin - tras),
    autor,
  }));
}

let siguienteId = 1038;

export function crearPedido(d: {
  cliente: string;
  estado: EstadoPedido;
  haceMin: number;
  pago: MetodoPago;
  lineas: LineaPedido[];
  direccion: string;
  telefono: string;
  nota?: string;
  tiempo?: number;
  repartidor?: RepartidorNegocio;
}): PedidoNegocio {
  const id = siguienteId++;
  const subtotal = redondear(d.lineas.reduce((s, l) => s + l.importe, 0));
  const hist = historial(d.estado, d.haceMin, d.cliente, d.repartidor?.nombre);
  return {
    id,
    codigo: `DF-${String(id).padStart(6, "0")}`,
    estado: d.estado,
    fechaCreacion: haceMin(d.haceMin),
    cliente: { nombre: d.cliente },
    direccionEntrega: d.direccion,
    telefonoContacto: d.telefono,
    metodoPago: d.pago,
    nota: d.nota ?? null,
    lineas: d.lineas,
    subtotal,
    gastosEnvio: GASTOS_ENVIO,
    total: redondear(subtotal + GASTOS_ENVIO),
    tiempoEstimadoMin: d.estado === "RECIBIDO" ? null : (d.tiempo ?? 25),
    motivoRechazo: null,
    reparto: d.repartidor
      ? { id: id + 5000, repartidor: { id: d.repartidor.id, nombre: d.repartidor.nombre }, fechaAsignacion: hist.at(-1)!.fecha, fechaEntrega: null }
      : null,
    historial: hist,
  };
}

const juan = repartidores[1]!;
juan.pedidosEnReparto = 1;

export const pedidos: PedidoNegocio[] = [
  crearPedido({ cliente: "Rafael Gómez", estado: "EN_REPARTO", haceMin: 33, pago: "TARJETA", lineas: lineas([1, "Hamburguesa de pollo"], [1, "Patatas fritas"]), direccion: "C/ Sevilla 41 · Osuna", telefono: "611 204 587", repartidor: juan }),
  crearPedido({ cliente: "José Martín", estado: "EN_PREPARACION", haceMin: 24, pago: "TARJETA", lineas: lineas([3, "Hamburguesa clásica"], [3, "Patatas fritas"]), direccion: "C/ Granada 3 · Osuna", telefono: "690 331 742", tiempo: 35 }),
  crearPedido({ cliente: "Carmen Ruiz", estado: "LISTO", haceMin: 20, pago: "EFECTIVO", lineas: lineas([2, "Bocadillo de lomo"], [1, "Patatas fritas"], [2, "Refresco de cola"]), direccion: "C/ Carrera 12, 2º B · Osuna", telefono: "677 845 120" }),
  crearPedido({ cliente: "María López", estado: "EN_PREPARACION", haceMin: 15, pago: "EFECTIVO", lineas: lineas([1, "Hamburguesa doble"], [1, "Aros de cebolla"]), direccion: "Plaza Mayor 2 · Osuna", telefono: "654 778 019" }),
  crearPedido({ cliente: "Lucía Ramírez", estado: "RECIBIDO", haceMin: 8, pago: "EFECTIVO", lineas: lineas([2, "Hamburguesa clásica"], [1, "Patatas fritas"], [2, "Refresco de cola"]), direccion: "C/ Asistente 17 · Osuna", telefono: "698 120 455" }),
  crearPedido({ cliente: "Antonio Pérez", estado: "RECIBIDO", haceMin: 3, pago: "TARJETA", lineas: lineas([1, "Menú DeliFast"], [1, "Nuggets (6 uds.)"], [1, "Refresco de cola"]), direccion: "Av. de la Constitución 8, 1º A · Osuna", telefono: "612 345 678", nota: "Sin cebolla en el menú, por favor." }),
];

/** Pedidos que el simulador "recibe" mientras la página está abierta (Realtime simulado). */
export const pedidosEntrantes: Parameters<typeof crearPedido>[0][] = [
  { cliente: "Elena Navarro", estado: "RECIBIDO", haceMin: 0, pago: "TARJETA", lineas: lineas([2, "Menú DeliFast"], [2, "Refresco de cola"]), direccion: "C/ San Pedro 9 · Osuna", telefono: "625 908 311", nota: "Llamar al timbre del 2º." },
  { cliente: "Francisco Ortiz", estado: "RECIBIDO", haceMin: 0, pago: "EFECTIVO", lineas: lineas([1, "Hamburguesa doble"], [1, "Patatas fritas"], [1, "Nuggets (6 uds.)"]), direccion: "C/ Alpechín 4 · Osuna", telefono: "689 457 002" },
  { cliente: "Rosa Jiménez", estado: "RECIBIDO", haceMin: 0, pago: "TARJETA", lineas: lineas([1, "Bocadillo de lomo"], [1, "Aros de cebolla"]), direccion: "C/ Sevilla 12 · Osuna", telefono: "601 222 739" },
];

miNegocio.pedidosHoy += pedidos.length;
