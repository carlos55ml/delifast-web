/**
 * Interruptores de entorno de la web. Todos son NEXT_PUBLIC_ porque se leen en el navegador.
 *
 * - NEXT_PUBLIC_API_MOCK=true: la API no se llama; responde un simulador en memoria
 *   (src/lib/api/mock) que cumple el mismo contrato (docs/api/openapi.yaml).
 * - NEXT_PUBLIC_AUTH_MOCK=true: no se usa Supabase; hay una sesión fija de administrador.
 *   Solo para desarrollo y demostraciones, nunca en producción.
 */
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  apiMock: process.env.NEXT_PUBLIC_API_MOCK === "true",
  authMock: process.env.NEXT_PUBLIC_AUTH_MOCK === "true",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;
