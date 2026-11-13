import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

/** Plantilla de W00: panel de marca con degradado a la izquierda y el formulario a la derecha. */
export function PantallaAcceso({ titulo, descripcion, children, pie }: { titulo: string; descripcion: string; children: ReactNode; pie?: ReactNode }) {
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
          <h1 className="texto-titulo-xl">{titulo}</h1>
          <p className="texto-normal text-neutro-texto-secundario">{descripcion}</p>
          {children}
          {pie && <div className="texto-pequeno text-neutro-texto-secundario">{pie}</div>}
        </div>
      </main>
    </div>
  );
}
