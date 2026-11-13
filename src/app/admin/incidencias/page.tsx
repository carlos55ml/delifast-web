import type { Metadata } from "next";
import { VistaIncidencias } from "@/components/admin/VistaIncidencias";

export const metadata: Metadata = { title: "Incidencias" };

export default function PaginaIncidencias() {
  return <VistaIncidencias />;
}
