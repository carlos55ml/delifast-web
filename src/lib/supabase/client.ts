import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para el navegador: solo inicio de sesión, Realtime y lectura de imágenes.
 * Cualquier operación que cambie datos pasa por la API (src/lib/api.ts).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
