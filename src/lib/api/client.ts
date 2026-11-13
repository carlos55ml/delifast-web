import createClient, { type Middleware } from "openapi-fetch";
import { config } from "@/lib/config";
import type { paths } from "./schema";
import type { Problema } from "./tipos";

/**
 * Cliente tipado de la API REST de DeliFast. Los tipos salen del contrato
 * docs/api/openapi.yaml (`npm run api:types`), así que una ruta o un campo que no
 * existe en el contrato no compila.
 *
 * La web llama a la API desde el navegador con el token del usuario (arquitectura, decisión 4).
 */
export const api = createClient<paths>({ baseUrl: config.apiUrl });

/** Añade el access token de Supabase a cada petición. */
const autenticacion: Middleware = {
  async onRequest({ request }) {
    if (config.authMock) return request;
    const { createClient: crearSupabase } = await import("@/lib/supabase/client");
    const { data } = await crearSupabase().auth.getSession();
    if (data.session) request.headers.set("Authorization", `Bearer ${data.session.access_token}`);
    return request;
  },
};

/**
 * Con NEXT_PUBLIC_API_MOCK=true la petición no sale del navegador: la responde el simulador,
 * que devuelve los mismos cuerpos y códigos que la API real (estilo MSW). Se carga con
 * import() para que los datos de ejemplo no lleguen al bundle cuando no se usan.
 */
const simulador: Middleware = {
  async onRequest({ request, schemaPath }) {
    const { responderSimulado } = await import("./mock/handlers");
    return responderSimulado(request, schemaPath);
  },
};

api.use(autenticacion);
if (config.apiMock) api.use(simulador);

/** Error de la API con el ProblemDetail (RFC 9457) que devuelve el backend. */
export class ErrorApi extends Error {
  constructor(
    public readonly status: number,
    public readonly problema?: Problema,
  ) {
    super(problema?.detail ?? problema?.title ?? mensajePorEstado(status));
    this.name = "ErrorApi";
  }
}

function mensajePorEstado(status: number): string {
  if (status === 401) return "Tu sesión ha caducado. Vuelve a iniciar sesión.";
  if (status === 403) return "No tienes permiso para hacer esto.";
  if (status === 404) return "No se ha encontrado lo que buscas.";
  if (status >= 500) return "La API no responde ahora mismo. Inténtalo de nuevo en un momento.";
  return `Error ${status} de la API`;
}

type Resultado<T> = { data?: T; error?: unknown; response: Response };

/**
 * Desenvuelve la respuesta de openapi-fetch: devuelve los datos o lanza ErrorApi.
 * Uso: `const negocios = await datos(api.GET("/admin/negocios"))`.
 */
export async function datos<T>(peticion: Promise<Resultado<T>>): Promise<T> {
  let resultado: Resultado<T>;
  try {
    resultado = await peticion;
  } catch {
    throw new ErrorApi(503, { status: 503, detail: "No se puede conectar con la API. ¿Está arrancado el backend?" });
  }
  const { data, error, response } = resultado;
  if (error !== undefined || !response.ok) {
    throw new ErrorApi(response.status, (error ?? undefined) as Problema | undefined);
  }
  return data as T;
}
