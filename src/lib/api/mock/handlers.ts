import { rolDemoNavegador } from "@/lib/auth/demo";
import type {
  AltaNegocio, DatosMiNegocio, DatosNegocio, DatosProducto, EstadoIncidencia, EstadoPedido, FranjaHorario, NegocioAdmin,
  PedidoNegocio, Problema, ProductoCarta, ResumenAdmin,
} from "../tipos";
import { incidencias, localidades, negocios, perfilAdmin, repartidoresEnRuta } from "./datos";
import { carta, miNegocio, pedidos, perfilNegocio, perfilRepartidor, repartidores } from "./datosNegocio";

/**
 * Simulador de la API (estilo MSW): responde en el navegador a las rutas del contrato
 * docs/api/openapi.yaml con los mismos cuerpos y códigos que dará el backend.
 */

const LATENCIA_MS = 250;
const esperar = () => new Promise((r) => setTimeout(r, LATENCIA_MS));

const json = (cuerpo: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json", ...headers } });

const problema = (status: number, detail: string, extra: Partial<Problema> = {}) =>
  new Response(JSON.stringify({ status, title: tituloPorEstado[status] ?? "Error", detail, ...extra } satisfies Problema), {
    status,
    headers: { "Content-Type": "application/problem+json" },
  });

const tituloPorEstado: Record<number, string> = {
  400: "Bad Request", 404: "Not Found", 409: "Conflict", 422: "Unprocessable Entity",
};

const ACTIVOS: EstadoPedido[] = ["RECIBIDO", "EN_PREPARACION", "LISTO", "EN_REPARTO"];

/** Persona del negocio que hace los cambios en la sesión de demostración. */
const autorNegocio = () => perfilNegocio.nombre;

function cambiarEstado(pedido: PedidoNegocio, nuevo: EstadoPedido) {
  pedido.historial.push({ estadoAnterior: pedido.estado, estadoNuevo: nuevo, fecha: new Date().toISOString(), autor: autorNegocio() });
  pedido.estado = nuevo;
}

const estadoCambiado = (pedido: PedidoNegocio) =>
  problema(409, `El pedido ${pedido.codigo} ya está en estado ${pedido.estado}. Recarga el tablero.`);

const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGEN = 2 * 1024 * 1024;

/** Lee un cuerpo multipart: la parte `datos` (JSON) y el fichero de la parte indicada. */
async function leerFormulario<T>(request: Request, parteArchivo: string): Promise<{ datos: T; archivo?: File; errores: string[] }> {
  const fd = await request.formData();
  const parte = fd.get("datos");
  const datos = JSON.parse(typeof parte === "string" ? parte : await (parte as Blob).text()) as T;
  const archivo = fd.get(parteArchivo);
  const errores: string[] = [];
  if (archivo instanceof File) {
    if (!TIPOS_IMAGEN.includes(archivo.type)) errores.push(`${parteArchivo}: debe ser una imagen JPEG, PNG o WebP`);
    else if (archivo.size > MAX_IMAGEN) errores.push(`${parteArchivo}: no puede pasar de 2 MB`);
  }
  return { datos, archivo: archivo instanceof File ? archivo : undefined, errores };
}

/** En el simulador la "subida a Storage" es una URL local del navegador. */
const urlLocal = (archivo: File) => URL.createObjectURL(archivo);

function validarProducto(d: Partial<DatosProducto>): string[] {
  const errores: string[] = [];
  if (!d.nombre?.trim()) errores.push("nombre: no puede estar vacío");
  if (typeof d.precio !== "number" || !(d.precio >= 0) || d.precio > 999.99) errores.push("precio: debe estar entre 0 y 999,99");
  if (!carta.some((c) => c.id === d.categoriaId)) errores.push("categoriaId: la categoría no existe");
  return errores;
}

const todosLosProductos = () => carta.flatMap((c) => c.productos);

/** Como el backend: el producto conserva su sitio; si es nuevo o cambia de categoría, va al final. */
function guardarProducto(producto: ProductoCarta) {
  const destino = carta.find((c) => c.id === producto.categoriaId)!;
  const i = destino.productos.findIndex((p) => p.id === producto.id);
  if (i >= 0) destino.productos[i] = producto;
  else {
    carta.forEach((c) => (c.productos = c.productos.filter((p) => p.id !== producto.id)));
    destino.productos.push(producto);
  }
}

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const minutos = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));

function validarHorarios(franjas: FranjaHorario[]): string[] {
  const errores: string[] = [];
  franjas.forEach((f, i) => {
    if (!(f.dia >= 1 && f.dia <= 7)) errores.push(`[${i}].dia: debe estar entre 1 y 7`);
    if (!HORA.test(f.apertura) || !HORA.test(f.cierre)) errores.push(`[${i}]: las horas van como HH:mm`);
    else if (f.apertura === f.cierre) errores.push(`[${i}]: la apertura y el cierre no pueden coincidir`);
  });
  for (let dia = 1; dia <= 7; dia++) {
    const delDia = franjas
      .filter((f) => f.dia === dia && HORA.test(f.apertura) && HORA.test(f.cierre))
      .map((f) => [minutos(f.apertura), minutos(f.cierre) <= minutos(f.apertura) ? minutos(f.cierre) + 1440 : minutos(f.cierre)] as const)
      .sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < delDia.length; i++) if (delDia[i]![0] < delDia[i - 1]![1]) errores.push(`dia ${dia}: hay franjas que se solapan`);
  }
  return errores;
}

const esHoy = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();
const sinResolver = (estado: EstadoIncidencia) => estado !== "RESUELTA";
const porFechaDesc = <T extends { fechaCreacion: string }>(a: T, b: T) => b.fechaCreacion.localeCompare(a.fechaCreacion);

function validarDatos(d: Partial<DatosNegocio>): string[] {
  const errores: string[] = [];
  if (!d.nombre?.trim()) errores.push("nombre: no puede estar vacío");
  if (!localidades.some((l) => l.id === d.localidadId)) errores.push("localidadId: la localidad no existe");
  if (!d.direccion?.trim()) errores.push("direccion: no puede estar vacía");
  if (!d.telefono || d.telefono.replace(/\D/g, "").length < 9) errores.push("telefono: debe tener al menos 9 cifras");
  return errores;
}

function resumen(): ResumenAdmin {
  const activos = negocios.filter((n) => n.activo);
  const abiertas = incidencias.filter((i) => sinResolver(i.estado));
  return {
    negociosActivos: activos.length,
    negociosTotales: negocios.length,
    pedidosHoy: activos.reduce((s, n) => s + n.pedidosHoy, 0),
    localidadesConPedidosHoy: new Set(activos.filter((n) => n.pedidosHoy > 0).map((n) => n.localidad.id)).size,
    incidenciasAbiertas: abiertas.length,
    incidenciasHoy: abiertas.filter((i) => esHoy(i.fechaCreacion)).length,
    repartidoresEnRuta,
    pedidosHoyPorNegocio: activos
      .map((n) => ({ negocioId: n.id, nombre: n.nombre, localidad: n.localidad.nombre, pedidos: n.pedidosHoy, abierto: n.abierto }))
      .sort((a, b) => b.pedidos - a.pedidos),
    incidenciasRecientes: [...abiertas].sort(porFechaDesc).slice(0, 5),
  };
}

export async function responderSimulado(request: Request, schemaPath: string): Promise<Response> {
  await esperar();
  const url = new URL(request.url);
  const id = Number(url.pathname.split("/")[3]);
  const ruta = `${request.method} ${schemaPath}`;
  const negocio = negocios.find((n) => n.id === id);
  const idPedido = Number(url.pathname.split("/")[url.pathname.startsWith("/negocio/") ? 3 : 2]);
  const pedido = pedidos.find((p) => p.id === idPedido);

  switch (ruta) {
    case "GET /me": {
      const rol = rolDemoNavegador();
      return json(rol === "NEGOCIO" ? perfilNegocio : rol === "REPARTIDOR" ? perfilRepartidor : perfilAdmin);
    }

    case "GET /negocio":
      return json(miNegocio);

    case "PUT /negocio": {
      const { datos, archivo, errores } = await leerFormulario<DatosMiNegocio>(request, "logo");
      if (!datos.nombre?.trim()) errores.push("nombre: no puede estar vacío");
      if (!datos.direccion?.trim()) errores.push("direccion: no puede estar vacía");
      if (!datos.telefono || datos.telefono.replace(/\D/g, "").length < 9) errores.push("telefono: debe tener al menos 9 cifras");
      if (!(datos.gastosEnvio >= 0 && datos.gastosEnvio <= 50)) errores.push("gastosEnvio: debe estar entre 0 y 50");
      if (!(datos.pedidoMinimo >= 0 && datos.pedidoMinimo <= 200)) errores.push("pedidoMinimo: debe estar entre 0 y 200");
      if (errores.length) return problema(400, "Datos de entrada no válidos", { errores });
      Object.assign(miNegocio, {
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion?.trim() || null,
        telefono: datos.telefono.trim(),
        direccion: datos.direccion.trim(),
        gastosEnvio: datos.gastosEnvio,
        pedidoMinimo: datos.pedidoMinimo,
      });
      if (archivo) miNegocio.logoUrl = urlLocal(archivo);
      return json(miNegocio);
    }

    case "PUT /negocio/horarios": {
      const franjas = (await request.json()) as FranjaHorario[];
      const errores = validarHorarios(franjas);
      if (errores.length) return problema(400, "Datos de entrada no válidos", { errores });
      miNegocio.horarios = [...franjas].sort((a, b) => a.dia - b.dia || a.apertura.localeCompare(b.apertura));
      return json(miNegocio);
    }

    case "GET /negocio/carta":
      return json([...carta].sort((a, b) => a.orden - b.orden));

    case "POST /negocio/categorias":
    case "PUT /negocio/categorias/{id}": {
      const { nombre } = (await request.json()) as { nombre: string };
      if (!nombre?.trim()) return problema(400, "Datos de entrada no válidos", { errores: ["nombre: no puede estar vacío"] });
      const editando = request.method === "PUT" ? carta.find((c) => c.id === id) : undefined;
      if (request.method === "PUT" && !editando) return problema(404, `No existe la categoría ${id}`);
      if (carta.some((c) => c !== editando && c.nombre.toLowerCase() === nombre.trim().toLowerCase()))
        return problema(409, `Ya tienes una categoría llamada ${nombre.trim()}`);
      if (editando) {
        editando.nombre = nombre.trim();
        return json(editando);
      }
      const nueva = { id: Math.max(0, ...carta.map((c) => c.id)) + 1, nombre: nombre.trim(), orden: Math.max(0, ...carta.map((c) => c.orden)) + 1, productos: [] };
      carta.push(nueva);
      return json(nueva, 201);
    }

    case "DELETE /negocio/categorias/{id}": {
      const cat = carta.find((c) => c.id === id);
      if (!cat) return problema(404, `No existe la categoría ${id}`);
      if (cat.productos.length) return problema(409, `${cat.nombre} aún tiene productos. Bórralos o muévelos a otra categoría antes.`);
      carta.splice(carta.indexOf(cat), 1);
      return new Response(null, { status: 204 });
    }

    case "POST /negocio/productos":
    case "PUT /negocio/productos/{id}": {
      const anterior = request.method === "PUT" ? todosLosProductos().find((p) => p.id === id) : undefined;
      if (request.method === "PUT" && !anterior) return problema(404, `No existe el producto ${id}`);
      const { datos, archivo, errores } = await leerFormulario<DatosProducto>(request, "foto");
      errores.push(...validarProducto(datos));
      if (errores.length) return problema(400, "Datos de entrada no válidos", { errores });
      const producto: ProductoCarta = {
        id: anterior?.id ?? Math.max(0, ...todosLosProductos().map((p) => p.id)) + 1,
        categoriaId: datos.categoriaId,
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion?.trim() || null,
        precio: Math.round(datos.precio * 100) / 100,
        disponible: datos.disponible,
        fotoUrl: archivo ? urlLocal(archivo) : datos.quitarFoto ? null : (anterior?.fotoUrl ?? null),
      };
      guardarProducto(producto);
      return json(producto, anterior ? 200 : 201);
    }

    case "DELETE /negocio/productos/{id}": {
      const cat = carta.find((c) => c.productos.some((p) => p.id === id));
      if (!cat) return problema(404, `No existe el producto ${id}`);
      cat.productos = cat.productos.filter((p) => p.id !== id);
      return new Response(null, { status: 204 });
    }

    case "PATCH /negocio/productos/{id}/disponible": {
      const producto = todosLosProductos().find((p) => p.id === id);
      if (!producto) return problema(404, `No existe el producto ${id}`);
      producto.disponible = ((await request.json()) as { disponible: boolean }).disponible;
      return json(producto);
    }

    case "PATCH /negocio/abierto": {
      const { abierto } = (await request.json()) as { abierto: boolean };
      miNegocio.abiertoManual = abierto;
      miNegocio.abierto = abierto; // el ejemplo siempre está en horario
      return json(miNegocio);
    }

    case "GET /negocio/pedidos": {
      const estados = url.searchParams.getAll("estado");
      const filtro = estados.length ? estados : ACTIVOS;
      return json(pedidos.filter((p) => filtro.includes(p.estado)).sort((a, b) => a.fechaCreacion.localeCompare(b.fechaCreacion)));
    }

    case "GET /negocio/pedidos/{id}":
      return pedido ? json(pedido) : problema(404, `No existe el pedido ${idPedido}`);

    case "POST /pedidos/{id}/aceptar": {
      if (!pedido) return problema(404, `No existe el pedido ${idPedido}`);
      const { tiempoEstimadoMin } = (await request.json()) as { tiempoEstimadoMin: number };
      if (!Number.isInteger(tiempoEstimadoMin) || tiempoEstimadoMin < 5 || tiempoEstimadoMin > 120)
        return problema(400, "Datos de entrada no válidos", { errores: ["tiempoEstimadoMin: debe estar entre 5 y 120"] });
      if (pedido.estado !== "RECIBIDO") return estadoCambiado(pedido);
      pedido.tiempoEstimadoMin = tiempoEstimadoMin;
      cambiarEstado(pedido, "EN_PREPARACION");
      return json(pedido);
    }

    case "POST /pedidos/{id}/rechazar": {
      if (!pedido) return problema(404, `No existe el pedido ${idPedido}`);
      const { motivo } = (await request.json()) as { motivo: string };
      if (!motivo?.trim()) return problema(400, "Datos de entrada no válidos", { errores: ["motivo: no puede estar vacío"] });
      if (pedido.estado !== "RECIBIDO") return estadoCambiado(pedido);
      pedido.motivoRechazo = motivo.trim();
      cambiarEstado(pedido, "RECHAZADO");
      return json(pedido);
    }

    case "POST /pedidos/{id}/listo": {
      if (!pedido) return problema(404, `No existe el pedido ${idPedido}`);
      if (pedido.estado !== "EN_PREPARACION") return estadoCambiado(pedido);
      cambiarEstado(pedido, "LISTO");
      return json(pedido);
    }

    case "POST /pedidos/{id}/asignar": {
      if (!pedido) return problema(404, `No existe el pedido ${idPedido}`);
      const { repartidorId } = (await request.json()) as { repartidorId: string };
      if (pedido.estado !== "LISTO") return estadoCambiado(pedido);
      const repartidor = repartidores.find((r) => r.id === repartidorId);
      if (!repartidor || !repartidor.activo || !repartidor.disponible)
        return problema(422, "El repartidor no está activo y disponible en tu negocio.");
      cambiarEstado(pedido, "EN_REPARTO");
      pedido.reparto = { id: pedido.id + 5000, repartidor: { id: repartidor.id, nombre: repartidor.nombre }, fechaAsignacion: new Date().toISOString(), fechaEntrega: null };
      repartidor.pedidosEnReparto++;
      return json(pedido);
    }

    case "GET /negocio/repartidores": {
      const disponible = url.searchParams.get("disponible") === "true";
      const lista = disponible ? repartidores.filter((r) => r.activo && r.disponible) : repartidores;
      return json([...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")));
    }

    case "GET /localidades":
      return json(localidades);

    case "GET /admin/resumen":
      return json(resumen());

    case "GET /admin/negocios": {
      const activo = url.searchParams.get("activo");
      const lista = activo === null ? negocios : negocios.filter((n) => String(n.activo) === activo);
      return json([...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")));
    }

    case "POST /admin/negocios": {
      const alta = (await request.json()) as AltaNegocio;
      const errores = validarDatos(alta);
      if (!alta.dueno?.nombre?.trim()) errores.push("dueno.nombre: no puede estar vacío");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(alta.dueno?.email ?? "")) errores.push("dueno.email: no es un email válido");
      if (errores.length) return problema(400, "Datos de entrada no válidos", { errores });
      const email = alta.dueno.email.trim().toLowerCase();
      if (negocios.some((n) => n.dueno?.email === email)) return problema(409, `Ya existe una cuenta con el email ${email}`);
      const nuevo: NegocioAdmin = {
        id: Math.max(...negocios.map((n) => n.id)) + 1,
        nombre: alta.nombre.trim(),
        localidad: localidades.find((l) => l.id === alta.localidadId)!,
        direccion: alta.direccion.trim(),
        telefono: alta.telefono.trim(),
        dueno: { id: crypto.randomUUID(), nombre: alta.dueno.nombre.trim(), email },
        pedidosHoy: 0,
        abierto: false,
        activo: true,
        fechaAlta: new Date().toISOString(),
      };
      negocios.push(nuevo);
      return json(nuevo, 201, { Location: `/admin/negocios/${nuevo.id}` });
    }

    case "PUT /admin/negocios/{id}": {
      if (!negocio) return problema(404, `No existe el negocio ${id}`);
      const datos = (await request.json()) as DatosNegocio;
      const errores = validarDatos(datos);
      if (errores.length) return problema(400, "Datos de entrada no válidos", { errores });
      Object.assign(negocio, {
        nombre: datos.nombre.trim(),
        localidad: localidades.find((l) => l.id === datos.localidadId)!,
        direccion: datos.direccion.trim(),
        telefono: datos.telefono.trim(),
      });
      return json(negocio);
    }

    case "PATCH /admin/negocios/{id}/activo": {
      if (!negocio) return problema(404, `No existe el negocio ${id}`);
      const { activo } = (await request.json()) as { activo: boolean };
      negocio.activo = activo;
      if (!activo) negocio.abierto = false;
      return json(negocio);
    }

    case "GET /admin/incidencias": {
      const estados = url.searchParams.getAll("estado");
      const negocioId = url.searchParams.get("negocioId");
      return json(
        incidencias
          .filter((i) => estados.length === 0 || estados.includes(i.estado))
          .filter((i) => negocioId === null || i.negocio.id === Number(negocioId))
          .sort(porFechaDesc),
      );
    }

    default:
      return problema(404, `El simulador no implementa ${ruta}`);
  }
}
