import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { config } from "@/lib/config";

let cliente: SupabaseClient | null = null;

/**
 * Cliente de Supabase para el navegador: solo inicio de sesión, Realtime y lectura de imágenes.
 * Cualquier operación que cambie datos pasa por la API (src/lib/api).
 * La sesión se guarda en cookies para que el proxy (src/proxy.ts) también la vea.
 */
export function createClient(): SupabaseClient {
  cliente ??= createBrowserClient(config.supabaseUrl, config.supabaseAnonKey);
  return cliente;
}
