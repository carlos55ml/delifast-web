"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icono, type NombreIcono } from "@/components/ui/Icono";
import { Logo } from "@/components/ui/Logo";
import { cerrarSesion } from "@/lib/auth/sesion";
import { iniciales } from "@/lib/formato";
import { useUsuario } from "./UsuarioContexto";

const secciones: { href: string; texto: string; icono: NombreIcono }[] = [
  { href: "/admin", texto: "Resumen", icono: "resumen" },
  { href: "/admin/negocios", texto: "Negocios", icono: "negocios" },
  { href: "/admin/incidencias", texto: "Incidencias", icono: "incidencias" },
];

const elemento = "flex h-11 w-full items-center gap-3 rounded-[10px] px-3 py-2.5 texto-normal transition focus-visible:outline-2 focus-visible:outline-marca-rojo";

/** "Barra lateral/Admin" de Figma. */
export function BarraLateral() {
  const ruta = usePathname();
  const usuario = useUsuario();

  return (
    <nav aria-label="Administración" className="sticky top-0 flex h-dvh w-[264px] shrink-0 flex-col gap-1 border-r border-neutro-borde bg-white px-4 pt-6 pb-5">
      <Link href="/admin" className="pb-6 pl-3" aria-label="DeliFast: ir al resumen">
        <Logo />
      </Link>

      {secciones.map(({ href, texto, icono }) => {
        const activa = href === "/admin" ? ruta === href : ruta.startsWith(href);
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
          <p className="texto-etiqueta text-neutro-texto-secundario">Administrador</p>
        </div>
      </div>
      <button type="button" onClick={cerrarSesion} className={`${elemento} cursor-pointer text-neutro-texto-secundario hover:bg-neutro-fondo`}>
        <Icono nombre="cerrar-sesion" />
        Cerrar sesión
      </button>
    </nav>
  );
}
