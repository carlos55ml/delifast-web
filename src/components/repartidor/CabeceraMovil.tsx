import type { ReactNode } from "react";

/** Cabecera blanca de las pantallas del repartidor (con margen arriba para la barra de estado). */
export function CabeceraMovil({ titulo, subtitulo, izquierda, derecha }: { titulo: string; subtitulo?: string; izquierda?: ReactNode; derecha?: ReactNode }) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 bg-white px-4 pt-[max(16px,env(safe-area-inset-top))] pb-4 md:pt-6">
      <div className="flex min-w-0 items-center gap-3">
        {izquierda}
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="truncate texto-titulo-l">{titulo}</h1>
          {subtitulo && <p className="truncate texto-pequeno text-neutro-texto-secundario">{subtitulo}</p>}
        </div>
      </div>
      {derecha}
    </header>
  );
}
