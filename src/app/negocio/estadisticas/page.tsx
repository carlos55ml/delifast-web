import type { Metadata } from "next";
import { VistaEstadisticas } from "@/components/negocio/estadisticas/VistaEstadisticas";

export const metadata: Metadata = { title: "Estadísticas" };

/** N06 Estadísticas del negocio. */
export default function PaginaEstadisticas() {
  return <VistaEstadisticas />;
}
