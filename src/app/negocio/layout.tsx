import type { Metadata } from "next";
import { BarraLateralNegocio } from "@/components/negocio/BarraLateralNegocio";
import { ProveedorNegocio } from "@/components/negocio/NegocioContexto";
import { AvisoModo } from "@/components/panel/AvisoModo";
import { ProveedorUsuario } from "@/components/panel/UsuarioContexto";

export const metadata: Metadata = { title: { default: "Negocio", template: "%s · Negocio · DeliFast" } };

/** Zona /negocio (dueño y empleados). El proxy ya comprueba que el usuario es NEGOCIO. */
export default function LayoutNegocio({ children }: LayoutProps<"/negocio">) {
  return (
    <ProveedorUsuario>
      <ProveedorNegocio>
        <div className="flex min-h-dvh">
          <BarraLateralNegocio />
          <div className="flex min-w-0 flex-1 flex-col">
            <AvisoModo />
            {children}
          </div>
        </div>
      </ProveedorNegocio>
    </ProveedorUsuario>
  );
}
