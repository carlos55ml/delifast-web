import { NextResponse, type NextRequest } from "next/server";
import { config as entorno } from "@/lib/config";
import { COOKIE_ROL_DEMO, rolDemo } from "@/lib/auth/demo";
import { ROL_POR_ZONA, ZONA_POR_ROL, rolDesdeClaims, zonaDeRuta } from "@/lib/auth/roles";
import { actualizarSesion } from "@/lib/supabase/proxy";

/**
 * Acceso por rol (arquitectura 5.1, RF-02): sin sesión se va a /login y cada usuario solo
 * entra en su zona; un repartidor que escribe /admin vuelve a /repartidor. La API vuelve a
 * comprobar el rol en cada petición, así que esto es comodidad, no la única barrera.
 */
export async function proxy(request: NextRequest) {
  const ruta = request.nextUrl.pathname;

  // Sesión de demostración: el rol elegido en /login va en una cookie (src/lib/auth/demo.ts).
  const { response, claims } = entorno.authMock
    ? demo(request)
    : await actualizarSesion(request);
  const rol = rolDesdeClaims(claims);
  const zonaPropia = rol ? ZONA_POR_ROL[rol] : null;
  const zona = zonaDeRuta(ruta);

  const redirigir = (destino: string) => {
    const redireccion = NextResponse.redirect(new URL(destino, request.url));
    // Conserva las cookies de sesión refrescadas.
    response.cookies.getAll().forEach((cookie) => redireccion.cookies.set(cookie));
    return redireccion;
  };

  if (ruta === "/" || ruta === "/login") {
    return zonaPropia ? redirigir(zonaPropia) : response;
  }

  if (zona) {
    if (!claims) return redirigir(`/login?siguiente=${encodeURIComponent(ruta)}`);
    if (rol !== ROL_POR_ZONA[zona]) return redirigir(zonaPropia ?? "/login?error=sin-acceso");
  }

  return response;
}

function demo(request: NextRequest) {
  const rol = rolDemo(request.cookies.get(COOKIE_ROL_DEMO)?.value);
  return { response: NextResponse.next(), claims: rol ? { user_rol: rol } : null };
}

export const config = {
  // Todo menos estáticos, imágenes optimizadas y ficheros de public/.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|iconos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
