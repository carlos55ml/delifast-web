import type { Metadata } from "next";
import { AvisoModo } from "@/components/admin/AvisoModo";
import { BarraLateral } from "@/components/admin/BarraLateral";
import { ProveedorUsuario } from "@/components/admin/UsuarioContexto";

export const metadata: Metadata = { title: { default: "Administración", template: "%s · Administración · DeliFast" } };

/** Zona /admin: barra lateral fija y contenido. El proxy ya comprueba que el usuario es ADMINISTRADOR. */
export default function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  return (
    <ProveedorUsuario>
      <div className="flex min-h-dvh">
        <BarraLateral />
        <div className="flex min-w-0 flex-1 flex-col">
          <AvisoModo />
          {children}
        </div>
      </div>
    </ProveedorUsuario>
  );
}
