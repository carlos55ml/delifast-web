import { rolDemoNavegador } from "@/lib/auth/demo";
import type { AltaNegocio, DatosNegocio, EstadoIncidencia, EstadoPedido, NegocioAdmin, PedidoNegocio, Problema, ResumenAdmin } from "../tipos";
import { incidencias, localidades, negocios, perfilAdmin, repartidoresEnRuta } from "./datos";
import { miNegocio, pedidos, perfilNegocio, perfilRepartidor, repartidores } from "./datosNegocio";

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
