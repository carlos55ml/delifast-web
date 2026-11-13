import type { ReactNode } from "react";

/** Bloque blanco con sombra "Sombra/Tarjeta" y cabecera opcional (tablas de A01-A04). */
export function Tarjeta({ titulo, subtitulo, accion, children, className = "" }: {
  titulo?: string;
  subtitulo?: string;
  accion?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col rounded-2xl bg-white px-6 py-5 shadow-tarjeta ${className}`}>
      {(titulo || accion) && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <div className="flex flex-col gap-0.5">
            {titulo && <h2 className="texto-subtitulo">{titulo}</h2>}
            {subtitulo && <p className="texto-pequeno text-neutro-texto-secundario">{subtitulo}</p>}
          </div>
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}

/** Mensaje dentro de una tabla vacía, cargando o con error. */
export function EstadoTabla({ children, error, onReintentar }: { children: ReactNode; error?: boolean; onReintentar?: () => void }) {
  return (
    <div role={error ? "alert" : "status"} className={`flex items-center gap-3 py-8 texto-normal ${error ? "text-estado-error" : "text-neutro-texto-secundario"}`}>
      <span>{children}</span>
      {onReintentar && (
        <button type="button" onClick={onReintentar} className="cursor-pointer texto-destacado text-marca-rojo underline">
          Reintentar
        </button>
      )}
    </div>
  );
}
