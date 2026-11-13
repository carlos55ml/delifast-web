import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/ui/Logo";
import { FormularioLogin } from "./FormularioLogin";

export const metadata: Metadata = { title: "Inicia sesión" };

/** W00 Login web. */
export default function PaginaLogin() {
  return (
    <div className="flex min-h-dvh flex-col bg-white md:flex-row">
      <section className="degradado-marca flex flex-col justify-center gap-6 px-6 py-12 text-white md:flex-1 md:px-20">
        <Logo variante="blanco" tamano={65.64} />
        <p className="max-w-[460px] texto-subtitulo">Panel para negocios, repartidores y administración de DeliFast.</p>
        <p className="max-w-[460px] texto-normal opacity-90">
          Recibe pedidos en tiempo real, organiza el reparto y consulta tus estadísticas desde el navegador.
        </p>
      </section>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-[400px] flex-col gap-5">
          <h1 className="texto-titulo-xl">Inicia sesión</h1>
          <p className="texto-normal text-neutro-texto-secundario">Usa la cuenta que te ha dado tu negocio o el administrador.</p>
          {/* useSearchParams necesita un Suspense con Cache Components */}
          <Suspense>
            <FormularioLogin />
          </Suspense>
          <p className="texto-pequeno text-neutro-texto-secundario">
            Te llevamos a tu zona según tu cuenta: negocio, repartidor o administración.
          </p>
        </div>
      </main>
    </div>
  );
}
