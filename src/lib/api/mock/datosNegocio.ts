import type { CambioEstado, CategoriaCarta, EmpleadoNegocio, IncidenciaNegocio, EstadoPedido, FranjaHorario, LineaPedido, MetodoPago, MiNegocio, PedidoNegocio, Perfil, RepartidorNegocio } from "../tipos";
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
  { id: "00000000-0000-4000-8000-000000000201", nombre: "Marta Díaz", email: "marta@hamburgueseriapepe.es", telefono: "655 333 444", activo: true, disponible: true, pedidosEnReparto: 0, repartosHoy: 4 },
  { id: "00000000-0000-4000-8000-000000000202", nombre: "Juan Torres", email: "juan@hamburgueseriapepe.es", telefono: "655 111 222", activo: true, disponible: true, pedidosEnReparto: 0, repartosHoy: 5 },
  { id: "00000000-0000-4000-8000-000000000203", nombre: "Sergio Ortega", email: "sergio@hamburgueseriapepe.es", telefono: "655 555 666", activo: false, disponible: false, pedidosEnReparto: 0, repartosHoy: 0 },
];

/** Personas del negocio de N04: el dueño y dos empleados. */
export const empleados: EmpleadoNegocio[] = [
  { id: pepe.dueno!.id, nombre: "Pepe García", email: pepe.dueno!.email, telefono: "655 112 233", esDueno: true, activo: true },
  { id: "00000000-0000-4000-8000-000000000211", nombre: "Ana Moreno", email: "ana@hamburgueseriapepe.es", telefono: "622 418 903", esDueno: false, activo: true },
  { id: "00000000-0000-4000-8000-000000000212", nombre: "Luis Castro", email: "luis@hamburgueseriapepe.es", telefono: null, esDueno: false, activo: true },
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

/** Horario de N07: lunes cerrado; partido el resto, hasta medianoche viernes y sábado. */
const horarios: FranjaHorario[] = [2, 3, 4, 5, 6, 7].flatMap((dia) => [
  { dia, apertura: "12:30", cierre: dia >= 6 ? "16:30" : "16:00" },
  { dia, apertura: "20:00", cierre: dia === 5 || dia === 6 ? "00:00" : "23:30" },
]);

export const miNegocio: MiNegocio = {
  id: pepe.id,
  nombre: pepe.nombre,
  descripcion: "Hamburguesas caseras con pan de obrador.",
  localidad: localidades.find((l) => l.nombre === "Osuna")!,
  direccion: "C/ Sevilla 24",
  telefono: "955 820 123",
  logoUrl: null,
  gastosEnvio: 1.5,
  pedidoMinimo: 10,
  horarios,
  abierto: true,
  abiertoManual: true,
  pedidosHoy: 8, // los de antes, ya entregados; abajo se suman los del tablero
};

let siguienteProducto = 1;
const categoria = (id: number, nombre: string, productos: [nombre: string, descripcion: string, precio: number, disponible?: boolean][]): CategoriaCarta => ({
  id,
  nombre,
  orden: id,
  productos: productos.map(([nombre, descripcion, precio, disponible = true]) => ({
    id: siguienteProducto++, categoriaId: id, nombre, descripcion, precio, fotoUrl: null, disponible,
  })),
});

/** Carta de N03: 5 categorías y 20 productos. */
export const carta: CategoriaCarta[] = [
  categoria(1, "Hamburguesas", [
    ["Hamburguesa clásica", "Ternera, queso, lechuga y tomate", 6.5],
    ["Hamburguesa doble", "Doble de ternera, doble de queso y bacon", 8.9],
    ["Hamburguesa de pollo", "Pollo crujiente, lechuga y mayonesa", 6.9],
    ["Hamburguesa vegetal", "Burger de garbanzos y verduras asadas", 7.2, false],
    ["Menú DeliFast", "Hamburguesa clásica, patatas y bebida", 8.5],
    ["Hamburguesa infantil", "Ternera y queso, tamaño pequeño", 4.9],
  ]),
  categoria(2, "Bocadillos", [
    ["Bocadillo de lomo", "Lomo a la plancha con pimientos", 5.5],
    ["Bocadillo de calamares", "Calamares fritos con alioli", 6],
    ["Serranito", "Lomo, jamón serrano y pimiento frito", 6.2],
    ["Bocadillo vegetal", "Lechuga, tomate, huevo y mayonesa", 4.5],
  ]),
  categoria(3, "Patatas y entrantes", [
    ["Patatas fritas", "Ración de patatas caseras", 2.8],
    ["Aros de cebolla", "8 unidades con salsa barbacoa", 3.5],
    ["Nuggets (6 uds.)", "Pollo empanado con salsa a elegir", 4.2],
  ]),
  categoria(4, "Bebidas", [
    ["Refresco de cola", "Lata de 33 cl", 1.7],
    ["Refresco de naranja", "Lata de 33 cl", 1.7],
    ["Agua mineral", "Botella de 50 cl", 1.2],
    ["Cerveza", "Botellín de 33 cl", 1.9],
    ["Zumo de naranja", "Natural, 25 cl", 2.5],
  ]),
  categoria(5, "Postres", [
    ["Tarta de queso", "Casera, con mermelada de frutos rojos", 3.8],
    ["Brownie", "Con nueces y bola de helado", 4],
  ]),
];

const CARTA: Record<string, number> = Object.fromEntries(carta.flatMap((c) => c.productos.map((p) => [p.nombre, p.precio])));

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
  const autores = ["Pepe García", "Ana Moreno", repartidor ? "Pepe García" : "Ana Moreno"];
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

/** Marca como ENTREGADO un pedido EN_REPARTO, hace `haceMinutos`. */
function entregado(p: PedidoNegocio, haceMinutos: number): PedidoNegocio {
  const fecha = haceMin(haceMinutos);
  p.historial.push({ estadoAnterior: "EN_REPARTO", estadoNuevo: "ENTREGADO", fecha, autor: p.reparto!.repartidor.nombre });
  p.estado = "ENTREGADO";
  p.reparto!.fechaEntrega = fecha;
  return p;
}

const juan = repartidores[1]!;
juan.pedidosEnReparto = 1;
juan.repartosHoy++;

export const pedidos: PedidoNegocio[] = [
  crearPedido({ cliente: "Rafael Gómez", estado: "EN_REPARTO", haceMin: 33, pago: "TARJETA", lineas: lineas([1, "Hamburguesa de pollo"], [1, "Patatas fritas"]), direccion: "C/ Sevilla 41 · Osuna", telefono: "611 204 587", repartidor: juan }),
  crearPedido({ cliente: "José Martín", estado: "EN_PREPARACION", haceMin: 24, pago: "TARJETA", lineas: lineas([3, "Hamburguesa clásica"], [3, "Patatas fritas"]), direccion: "C/ Granada 3 · Osuna", telefono: "690 331 742", tiempo: 35 }),
  crearPedido({ cliente: "Carmen Ruiz", estado: "LISTO", haceMin: 20, pago: "EFECTIVO", lineas: lineas([2, "Bocadillo de lomo"], [1, "Patatas fritas"], [2, "Refresco de cola"]), direccion: "C/ Carrera 12, 2º B · Osuna", telefono: "677 845 120" }),
  crearPedido({ cliente: "María López", estado: "EN_PREPARACION", haceMin: 15, pago: "EFECTIVO", lineas: lineas([1, "Hamburguesa doble"], [1, "Aros de cebolla"]), direccion: "Plaza Mayor 2 · Osuna", telefono: "654 778 019" }),
  crearPedido({ cliente: "Lucía Ramírez", estado: "RECIBIDO", haceMin: 8, pago: "EFECTIVO", lineas: lineas([2, "Hamburguesa clásica"], [1, "Patatas fritas"], [2, "Refresco de cola"]), direccion: "C/ Asistente 17 · Osuna", telefono: "698 120 455" }),
  crearPedido({ cliente: "Antonio Pérez", estado: "RECIBIDO", haceMin: 3, pago: "TARJETA", lineas: lineas([1, "Menú DeliFast"], [1, "Nuggets (6 uds.)"], [1, "Refresco de cola"]), direccion: "Av. de la Constitución 8, 1º A · Osuna", telefono: "612 345 678", nota: "Sin cebolla en el menú, por favor." }),
  // Ya entregado hoy por Juan (sale en "Entregados" de su vista). Va al final para no mover los números de N01.
  entregado(crearPedido({ cliente: "Inés Campos", estado: "EN_REPARTO", haceMin: 80, pago: "EFECTIVO", lineas: lineas([1, "Serranito"], [1, "Cerveza"]), direccion: "C/ San Agustín 6 · Osuna", telefono: "633 120 974", repartidor: juan }), 52),
];

/** Pedidos que el simulador "recibe" mientras la página está abierta (Realtime simulado). */
export const pedidosEntrantes: Parameters<typeof crearPedido>[0][] = [
  { cliente: "Elena Navarro", estado: "RECIBIDO", haceMin: 0, pago: "TARJETA", lineas: lineas([2, "Menú DeliFast"], [2, "Refresco de cola"]), direccion: "C/ San Pedro 9 · Osuna", telefono: "625 908 311", nota: "Llamar al timbre del 2º." },
  { cliente: "Francisco Ortiz", estado: "RECIBIDO", haceMin: 0, pago: "EFECTIVO", lineas: lineas([1, "Hamburguesa doble"], [1, "Patatas fritas"], [1, "Nuggets (6 uds.)"]), direccion: "C/ Alpechín 4 · Osuna", telefono: "689 457 002" },
  { cliente: "Rosa Jiménez", estado: "RECIBIDO", haceMin: 0, pago: "TARJETA", lineas: lineas([1, "Bocadillo de lomo"], [1, "Aros de cebolla"]), direccion: "C/ Sevilla 12 · Osuna", telefono: "601 222 739" },
];

miNegocio.pedidosHoy += pedidos.length - 1; // el entregado ya está entre los 8

/** Incidencias de N05 (pedidos ya entregados de hoy). */
export const incidenciasNegocio: IncidenciaNegocio[] = [
  {
    id: 4, tipo: "CLIENTE_AUSENTE", estado: "ABIERTA", origen: "REPARTIDOR",
    descripcion: "He llamado dos veces y no contesta. Espero 5 minutos en la puerta.", respuesta: null,
    fechaCreacion: haceMin(45), fechaResolucion: null, autor: { nombre: "Juan Torres" },
    pedido: { id: 1036, codigo: "DF-001036", total: 12.4, metodoPago: "EFECTIVO", cliente: { nombre: "María López", telefono: "612 987 654" } },
  },
  {
    id: 3, tipo: "FALTA_PRODUCTO", estado: "ABIERTA", origen: "CLIENTE",
    descripcion: "Faltan las patatas del menú.", respuesta: null,
    fechaCreacion: haceMin(67), fechaResolucion: null, autor: { nombre: "Pablo Ruiz" },
    pedido: { id: 1031, codigo: "DF-001031", total: 17.6, metodoPago: "TARJETA", cliente: { nombre: "Pablo Ruiz", telefono: "688 201 334" } },
  },
  {
    id: 2, tipo: "PRODUCTO_MAL_ESTADO", estado: "RESUELTA", origen: "CLIENTE",
    descripcion: "El pedido llegó frío.", respuesta: "Lo sentimos. Te devolvemos el importe de las hamburguesas.",
    fechaCreacion: haceMin(110), fechaResolucion: haceMin(80), autor: { nombre: "Elena Vega" },
    pedido: { id: 1027, codigo: "DF-001027", total: 21.9, metodoPago: "TARJETA", cliente: { nombre: "Elena Vega", telefono: "699 410 822" } },
  },
];
