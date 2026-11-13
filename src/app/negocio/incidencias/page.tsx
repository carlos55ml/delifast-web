import type { Metadata } from "next";
import { VistaIncidenciasNegocio } from "@/components/negocio/incidencias/VistaIncidenciasNegocio";

export const metadata: Metadata = { title: "Incidencias" };

/** N05 Incidencias del negocio. */
export default function PaginaIncidencias() {
  return <VistaIncidenciasNegocio />;
}
