import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { config } from "@/lib/config";

/**
 * Destino de los enlaces de Supabase Auth: recuperar contraseña (RF-03) e invitaciones a
 * cuentas nuevas (dueño, empleados y repartidores). Abre la sesión con el código del enlace
 * (PKCE, `?code=`) o con `token_hash` + `type` si la plantilla del email los usa, y lleva
 * a `siguiente` (por defecto /nueva-contrasena). Si el enlace no vale, vuelve a /recuperar.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const siguiente = url.searchParams.get("siguiente");
  const destino = siguiente?.startsWith("/") && !siguiente.startsWith("//") ? siguiente : "/nueva-contrasena";
  const error = NextResponse.redirect(new URL("/recuperar?error=enlace", url));
  if (!config.supabaseUrl || !config.supabaseAnonKey) return error;

  const respuesta = NextResponse.redirect(new URL(destino, url));
  const supabase = createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => cookies.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options)),
    },
  });

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const { error: fallo } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error("Falta el código del enlace") };

  return fallo ? error : respuesta;
}
