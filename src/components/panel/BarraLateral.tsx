"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icono, type NombreIcono } from "@/components/ui/Icono";
import { Logo } from "@/components/ui/Logo";
import { cerrarSesion } from "@/lib/auth/sesion";
import { iniciales } from "@/lib/formato";
import { useUsuario } from "./UsuarioContexto";

export type Seccion = { href: string; texto: string; icono: NombreIcono };

const elemento = "flex h-11 w-full items-center gap-3 rounded-[10px] px-3 py-2.5 texto-normal transition focus-visible:outline-2 focus-visible:outline-marca-rojo";

/**
 * "Barra lateral/Admin" y "Barra lateral/Negocio" de Figma. La primera sección es la de inicio
 * (solo está activa en su ruta exacta); el resto, en su ruta y las que cuelgan de ella.
 */
export function BarraLateral({ etiqueta, secciones, descripcionUsuario }: {
  etiqueta: string;
  secciones: Seccion[];
  /** Línea bajo el nombre: "Administrador", "Dueño · Hamburguesería Pepe"... */
  descripcionUsuario?: string;
}) {
  const ruta = usePathname();
  const usuario = useUsuario();
  const inicio = secciones[0]!.href;

  return (
    <nav aria-label={etiqueta} className="sticky top-0 flex h-dvh w-[264px] shrink-0 flex-col gap-1 border-r border-neutro-borde bg-white px-4 pt-6 pb-5">
      <Link href={inicio} className="pb-6 pl-3" aria-label={`DeliFast: ir a ${secciones[0]!.texto.toLowerCase()}`}>
        <Logo />
      </Link>

      {secciones.map(({ href, texto, icono }) => {
        const activa = href === inicio ? ruta === href : ruta.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activa ? "page" : undefined}
            className={`${elemento} ${activa ? "bg-marca-rojo-claro font-semibold text-marca-rojo" : "text-neutro-texto-secundario hover:bg-neutro-fondo"}`}
          >
            <Icono nombre={activa ? (`${icono}-activo` as NombreIcono) : icono} />
            {texto}
          </Link>
        );
      })}

      <div className="flex-1" />

      <div className="flex items-center gap-2.5 py-3 pl-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-marca-rojo-claro texto-destacado text-marca-rojo">
          {usuario ? iniciales(usuario.nombre) : ""}
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="truncate texto-destacado">{usuario?.nombre ?? "…"}</p>
          <p className="truncate texto-etiqueta text-neutro-texto-secundario">{descripcionUsuario}</p>
        </div>
      </div>
      <button type="button" onClick={cerrarSesion} className={`${elemento} cursor-pointer text-neutro-texto-secundario hover:bg-neutro-fondo`}>
        <Icono nombre="cerrar-sesion" />
        Cerrar sesión
      </button>
    </nav>
  );
}
