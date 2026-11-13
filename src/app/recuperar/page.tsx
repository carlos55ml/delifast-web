import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PantallaAcceso } from "@/components/acceso/PantallaAcceso";
import { FormularioRecuperar } from "./FormularioRecuperar";

export const metadata: Metadata = { title: "Recuperar contraseña" };

/** Recuperar la contraseña (RF-03), con el estilo de W00. */
export default function PaginaRecuperar() {
  return (
    <PantallaAcceso
      titulo="Recupera tu contraseña"
      descripcion="Escribe el email de tu cuenta y te enviaremos un enlace para crear una contraseña nueva."
      pie={<Link href="/login" className="font-semibold text-marca-rojo hover:underline">Volver a iniciar sesión</Link>}
    >
      <Suspense>
        <FormularioRecuperar />
      </Suspense>
    </PantallaAcceso>
  );
}
