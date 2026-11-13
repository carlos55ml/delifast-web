import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { config } from "@/lib/config";

/**
 * Refresca la sesión de Supabase en cada petición (patrón obligatorio de @supabase/ssr) y
 * devuelve los claims verificados del token, o null si no hay sesión.
 */
export async function actualizarSesion(request: NextRequest) {
  let response = NextResponse.next({ request });
  // Sin Supabase configurado (.env.local vacío) no hay sesión posible.
  if (!config.supabaseUrl || !config.supabaseAnonKey) return { response, claims: null };

  const supabase = createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([clave, valor]) => response.headers.set(clave, valor));
      },
    },
  });

  // getClaims() valida la firma del JWT (no basta con leer la cookie).
  const { data } = await supabase.auth.getClaims();
  return { response, claims: (data?.claims ?? null) as Record<string, unknown> | null };
}
