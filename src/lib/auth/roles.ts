import type { Rol } from "@/lib/api/tipos";

/** Zona de la web de cada rol. Los clientes usan la app móvil, no la web. */
export const ZONA_POR_ROL: Record<Rol, string | null> = {
  ADMINISTRADOR: "/admin",
  NEGOCIO: "/negocio",
  REPARTIDOR: "/repartidor",
  CLIENTE: null,
};

/** Rol que puede entrar en cada zona protegida. */
export const ROL_POR_ZONA: Record<string, Rol> = {
  "/admin": "ADMINISTRADOR",
  "/negocio": "NEGOCIO",
  "/repartidor": "REPARTIDOR",
};

const ROLES: readonly Rol[] = ["CLIENTE", "NEGOCIO", "REPARTIDOR", "ADMINISTRADOR"];

/**
 * Lee el rol de los claims del JWT de Supabase. El claim principal es `user_rol`, que añade
 * `custom_access_token_hook` (V1) leyéndolo de `perfiles`. Si el hook aún no está activado
 * en el proyecto, se usa `app_metadata.rol`, que solo puede escribir el backend.
 * Nunca se lee de `user_metadata`, que el propio usuario puede modificar.
 */
export function rolDesdeClaims(claims: Record<string, unknown> | null | undefined): Rol | null {
  if (!claims) return null;
  const appMetadata = claims.app_metadata as Record<string, unknown> | undefined;
  const valor = claims.user_rol ?? appMetadata?.rol;
  return typeof valor === "string" && (ROLES as readonly string[]).includes(valor) ? (valor as Rol) : null;
}

/** Zona protegida a la que pertenece una ruta, o null si es pública. */
export function zonaDeRuta(ruta: string): string | null {
  return Object.keys(ROL_POR_ZONA).find((zona) => ruta === zona || ruta.startsWith(`${zona}/`)) ?? null;
}
