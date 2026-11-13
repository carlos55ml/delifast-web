import type { Metadata } from "next";
import { VistaResumen } from "@/components/admin/VistaResumen";

export const metadata: Metadata = { title: "Resumen" };

export default function PaginaResumen() {
  return <VistaResumen />;
}
