import type { Metadata } from "next";
import { Suspense } from "react";
import { PantallaAcceso } from "@/components/acceso/PantallaAcceso";
import { FormularioLogin } from "./FormularioLogin";

export const metadata: Metadata = { title: "Inicia sesión" };

/** W00 Login web. */
export default function PaginaLogin() {
  return (
    <PantallaAcceso
      titulo="Inicia sesión"
      descripcion="Usa la cuenta que te ha dado tu negocio o el administrador."
      pie="Te llevamos a tu zona según tu cuenta: negocio, repartidor o administración."
    >
      {/* useSearchParams necesita un Suspense con Cache Components */}
      <Suspense>
        <FormularioLogin />
      </Suspense>
    </PantallaAcceso>
  );
}
