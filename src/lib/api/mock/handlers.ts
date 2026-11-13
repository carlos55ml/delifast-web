import type { AltaNegocio, DatosNegocio, EstadoIncidencia, NegocioAdmin, Problema, ResumenAdmin } from "../tipos";
import { incidencias, localidades, negocios, perfilAdmin, repartidoresEnRuta } from "./datos";

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

  switch (ruta) {
    case "GET /me":
      return json(perfilAdmin);

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
