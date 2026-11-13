import type { Metadata } from "next";
import { VistaEquipo } from "@/components/negocio/equipo/VistaEquipo";

export const metadata: Metadata = { title: "Equipo" };

/** N04 Equipo: empleados y repartidores. */
export default function PaginaEquipo() {
  return <VistaEquipo />;
}
