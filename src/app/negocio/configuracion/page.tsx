import type { Metadata } from "next";
import { VistaConfiguracion } from "@/components/negocio/configuracion/VistaConfiguracion";

export const metadata: Metadata = { title: "Configuración" };

/** N07 Configuración del negocio. */
export default function PaginaConfiguracion() {
  return <VistaConfiguracion />;
}
