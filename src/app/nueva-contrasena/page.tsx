import type { Metadata } from "next";
import { PantallaAcceso } from "@/components/acceso/PantallaAcceso";
import { FormularioNuevaContrasena } from "./FormularioNuevaContrasena";

export const metadata: Metadata = { title: "Nueva contraseña" };

/** Crear la contraseña tras el enlace de recuperación o de invitación (RF-03). */
export default function PaginaNuevaContrasena() {
  return (
    <PantallaAcceso titulo="Crea tu contraseña" descripcion="Elige una contraseña nueva para tu cuenta de DeliFast.">
      <FormularioNuevaContrasena />
    </PantallaAcceso>
  );
}
