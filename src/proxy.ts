import { NextResponse, type NextRequest } from "next/server";
import { config as entorno } from "@/lib/config";
import { ROL_POR_ZONA, ZONA_POR_ROL, rolDesdeClaims, zonaDeRuta } from "@/lib/auth/roles";
import { actualizarSesion } from "@/lib/supabase/proxy";

/**
 * Acceso por rol (arquitectura 5.1, RF-02): sin sesión se va a /login y cada usuario solo
 * entra en su zona; un repartidor que escribe /admin vuelve a /repartidor. La API vuelve a
 * comprobar el rol en cada petición, así que esto es comodidad, no la única barrera.
 */
export async function proxy(request: NextRequest) {
  const ruta = request.nextUrl.pathname;

  if (entorno.authMock) {
    // Sesión de demostración: siempre administrador.
    if (ruta === "/" || ruta === "/login") return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  const { response, claims } = await actualizarSesion(request);
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

export const config = {
  // Todo menos estáticos, imágenes optimizadas y ficheros de public/.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|iconos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
