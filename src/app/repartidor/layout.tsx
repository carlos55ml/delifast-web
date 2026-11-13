import type { Metadata, Viewport } from "next";
import { AvisoModo } from "@/components/panel/AvisoModo";
import { ProveedorUsuario } from "@/components/panel/UsuarioContexto";
import { ProveedorPerfilRepartidor } from "@/components/repartidor/PerfilContexto";

export const metadata: Metadata = {
  title: { default: "Repartidor", template: "%s · Repartidor · DeliFast" },
  appleWebApp: { capable: true, title: "DeliFast", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#d63031" };

/**
 * Zona /repartidor: vista móvil (PWA). En pantallas grandes se centra con el ancho de un móvil.
 * El proxy ya comprueba que el usuario es REPARTIDOR.
 */
export default function LayoutRepartidor({ children }: LayoutProps<"/repartidor">) {
  return (
    <ProveedorUsuario>
      <ProveedorPerfilRepartidor>
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-neutro-fondo shadow-tarjeta">
        <AvisoModo />
        {children}
      </div>
      </ProveedorPerfilRepartidor>
    </ProveedorUsuario>
  );
}
