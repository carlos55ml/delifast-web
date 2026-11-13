import type { Metadata } from "next";
import { AvisoModo } from "@/components/panel/AvisoModo";
import { BarraLateral, type Seccion } from "@/components/panel/BarraLateral";
import { ProveedorUsuario } from "@/components/panel/UsuarioContexto";

const secciones: Seccion[] = [
  { href: "/admin", texto: "Resumen", icono: "resumen" },
  { href: "/admin/negocios", texto: "Negocios", icono: "negocios" },
  { href: "/admin/incidencias", texto: "Incidencias", icono: "incidencias" },
];

export const metadata: Metadata = { title: { default: "Administración", template: "%s · Administración · DeliFast" } };

/** Zona /admin: barra lateral fija y contenido. El proxy ya comprueba que el usuario es ADMINISTRADOR. */
export default function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  return (
    <ProveedorUsuario>
      <div className="flex min-h-dvh">
        <BarraLateral etiqueta="Administración" secciones={secciones} descripcionUsuario="Administrador" />
        <div className="flex min-w-0 flex-1 flex-col">
          <AvisoModo />
          {children}
        </div>
      </div>
    </ProveedorUsuario>
  );
}
