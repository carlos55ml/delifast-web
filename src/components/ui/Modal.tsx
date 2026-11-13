"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icono } from "./Icono";

/**
 * Superposición con fondo oscuro (como A03 en Figma). Usa <dialog> nativo: Escape cierra,
 * el foco queda dentro y el resto de la página no es accesible mientras está abierta.
 */
export function Modal({ titulo, abierto, onCerrar, children }: { titulo: string; abierto: boolean; onCerrar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && onCerrar()}
      aria-labelledby="modal-titulo"
      className="m-auto w-[600px] max-w-[calc(100vw-32px)] rounded-[20px] bg-white p-0 text-neutro-texto shadow-tarjeta backdrop:bg-black/40"
    >
      <div className="flex flex-col gap-4 px-8 py-7">
        <div className="flex items-center justify-between gap-4">
          <h2 id="modal-titulo" className="texto-titulo-l">{titulo}</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-marca-rojo">
            <Icono nombre="cerrar" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
