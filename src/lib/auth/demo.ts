import type { Rol } from "@/lib/api/tipos";

/**
 * Sesión de demostración (NEXT_PUBLIC_AUTH_MOCK=true): el rol elegido en /login se guarda en
 * esta cookie, que leen el proxy (para las redirecciones) y el simulador (para GET /me).
 * Solo para desarrollo; con Supabase el rol sale del token.
 */
export const COOKIE_ROL_DEMO = "delifast-demo-rol";

const ROLES_WEB: readonly Rol[] = ["ADMINISTRADOR", "NEGOCIO", "REPARTIDOR"];

export function rolDemo(valor: string | undefined | null): Rol | null {
  return valor && (ROLES_WEB as readonly string[]).includes(valor) ? (valor as Rol) : null;
}

/** Rol de demostración leído de document.cookie (solo en el navegador). */
export function rolDemoNavegador(): Rol | null {
  if (typeof document === "undefined") return null;
  const par = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE_ROL_DEMO}=`));
  return rolDemo(par?.split("=")[1]);
}

export function fijarRolDemo(rol: Rol | null) {
  document.cookie = rol
    ? `${COOKIE_ROL_DEMO}=${rol}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`
    : `${COOKIE_ROL_DEMO}=; path=/; max-age=0`;
}
