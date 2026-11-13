import type { IncidenciaAdmin, Localidad, NegocioAdmin, Perfil } from "../tipos";

/**
 * Datos de ejemplo del simulador, los mismos del prototipo de Figma (A01-A04).
 * Viven en memoria: los cambios duran hasta recargar la página.
 */

export const perfilAdmin: Perfil = {
  id: "00000000-0000-4000-8000-000000000001",
  nombre: "Carlos Morán",
  email: "admin@delifast.es",
  telefono: null,
  rol: "ADMINISTRADOR",
  negocioId: null,
  esDueno: false,
};

export const localidades: Localidad[] = [
  { id: 1, nombre: "Écija", provincia: "Sevilla" },
  { id: 2, nombre: "El Saucejo", provincia: "Sevilla" },
  { id: 3, nombre: "Estepa", provincia: "Sevilla" },
  { id: 4, nombre: "Marchena", provincia: "Sevilla" },
  { id: 5, nombre: "Morón de la Frontera", provincia: "Sevilla" },
  { id: 6, nombre: "Osuna", provincia: "Sevilla" },
];

const localidad = (id: number) => localidades.find((l) => l.id === id)!;

/** Hace `dias` días a la hora indicada (hora local). */
function fecha(dias: number, hora: string): string {
  const [h, m] = hora.split(":").map(Number);
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

let siguienteUuid = 100;
const uuid = () => `00000000-0000-4000-8000-${String(siguienteUuid++).padStart(12, "0")}`;

type Fila = [nombre: string, localidadId: number, dueno: string, email: string, pedidosHoy: number, abierto: boolean, activo?: boolean];

const filas: Fila[] = [
  ["Pizzería La Plaza", 6, "Rocío Benítez", "rocio@pizzerialaplaza.es", 22, true],
  ["Kebab Estepa", 3, "Ahmed Benali", "ahmed@kebabestepa.es", 17, true],
  ["Burger Écija", 1, "Lucía Ortega", "lucia@burgerecija.es", 16, true],
  ["Hamburguesería Pepe", 6, "Pepe García", "pepe@hamburgueseriapepe.es", 14, true],
  ["Sushi Osuna", 6, "Kenji Morales", "kenji@sushiosuna.es", 14, true],
  ["Wok Estepa", 3, "Li Wei", "li@wokestepa.es", 13, true],
  ["Pollos Asados Marchena", 4, "Antonio Gil", "antonio@pollosmarchena.es", 13, true],
  ["Tacos Écija", 1, "Diego Romero", "diego@tacosecija.es", 11, true],
  ["Pizzería Napoli", 2, "Giulia Rossi", "giulia@napoli.es", 10, true],
  ["Bocatería El Paso", 1, "Marta Vega", "marta@bocateriaelpaso.es", 10, false],
  ["Bar El Rincón", 2, "Manuel Ruiz", "manuel@barelrincon.es", 9, false],
  ["Churrería La Esquina", 6, "Carmen López", "carmen@churrerialaesquina.es", 8, false],
  ["Asador Los Arcos", 4, "Isabel Navarro", "isabel@asadorlosarcos.es", 0, false, false],
];

export const negocios: NegocioAdmin[] = filas.map(([nombre, localidadId, dueno, email, pedidosHoy, abierto, activo = true], i) => ({
  id: i + 1,
  nombre,
  localidad: localidad(localidadId),
  direccion: `C/ Mayor ${i + 3}`,
  telefono: `955 82${String(i).padStart(2, "0")} ${100 + i * 7}`,
  dueno: { id: uuid(), nombre: dueno, email },
  pedidosHoy,
  abierto: activo && abierto,
  activo,
  fechaAlta: fecha(60 - i * 3, "10:00"),
}));

const negocio = (nombre: string) => {
  const n = negocios.find((x) => x.nombre === nombre)!;
  return { id: n.id, nombre: n.nombre };
};

export const incidencias: IncidenciaAdmin[] = [
  {
    id: 4, tipo: "CLIENTE_AUSENTE", estado: "ABIERTA", origen: "REPARTIDOR",
    descripcion: "Nadie abre en la dirección y el teléfono no contesta.", respuesta: null,
    fechaCreacion: fecha(0, "13:10"), fechaResolucion: null,
    pedido: { id: 1036, codigo: "DF-001036" }, negocio: negocio("Hamburguesería Pepe"),
  },
  {
    id: 3, tipo: "FALTA_PRODUCTO", estado: "ABIERTA", origen: "CLIENTE",
    descripcion: "Faltan las patatas del menú doble.", respuesta: null,
    fechaCreacion: fecha(0, "12:48"), fechaResolucion: null,
    pedido: { id: 1031, codigo: "DF-001031" }, negocio: negocio("Hamburguesería Pepe"),
  },
  {
    id: 2, tipo: "RETRASO", estado: "RESPONDIDA", origen: "CLIENTE",
    descripcion: "El pedido llegó 40 minutos tarde.", respuesta: "Lo sentimos, hubo mucha demanda. Te descontamos el envío en el próximo pedido.",
    fechaCreacion: fecha(0, "11:30"), fechaResolucion: null,
    pedido: { id: 2210, codigo: "DF-002210" }, negocio: negocio("Pizzería La Plaza"),
  },
  {
    id: 1, tipo: "DIRECCION_INCORRECTA", estado: "ABIERTA", origen: "REPARTIDOR",
    descripcion: "El número de la calle no existe.", respuesta: null,
    fechaCreacion: fecha(1, "21:15"), fechaResolucion: null,
    pedido: { id: 874, codigo: "DF-000874" }, negocio: negocio("Kebab Estepa"),
  },
  {
    id: 0, tipo: "PRODUCTO_MAL_ESTADO", estado: "RESUELTA", origen: "CLIENTE",
    descripcion: "La pizza llegó fría.", respuesta: "Te hemos devuelto el importe de la pizza.",
    fechaCreacion: fecha(2, "20:05"), fechaResolucion: fecha(2, "20:40"),
    pedido: { id: 2187, codigo: "DF-002187" }, negocio: negocio("Pizzería La Plaza"),
  },
  {
    id: -1, tipo: "OTRA", estado: "RESUELTA", origen: "REPARTIDOR",
    descripcion: "El cliente pagó con un billete de 100 € y no llevaba cambio suficiente.", respuesta: "El cliente pasó a pagar por la tarde.",
    fechaCreacion: fecha(4, "14:22"), fechaResolucion: fecha(3, "18:00"),
    pedido: { id: 1502, codigo: "DF-001502" }, negocio: negocio("Tacos Écija"),
  },
].map((inc, i, todas) => ({ ...inc, id: todas.length - i })) as IncidenciaAdmin[];

/** Repartidores con algún reparto EN_REPARTO ahora mismo. */
export const repartidoresEnRuta = 7;
