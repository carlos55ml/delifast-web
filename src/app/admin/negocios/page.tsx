import type { Metadata } from "next";
import { VistaNegocios } from "@/components/admin/VistaNegocios";

export const metadata: Metadata = { title: "Negocios" };

export default function PaginaNegocios() {
  return <VistaNegocios />;
}
