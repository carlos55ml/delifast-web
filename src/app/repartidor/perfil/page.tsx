import type { Metadata } from "next";
import { VistaPerfilRepartidor } from "@/components/repartidor/VistaPerfilRepartidor";

export const metadata: Metadata = { title: "Perfil" };

/** R06 Perfil del repartidor. */
export default function PaginaPerfil() {
  return <VistaPerfilRepartidor />;
}
