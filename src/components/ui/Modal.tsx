"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icono } from "./Icono";

/**
 * Superposición con fondo oscuro (como A03 en Figma). Usa <dialog> nativo: Escape cierra,
 * el foco queda dentro y el resto de la página no es accesible mientras está abierta.
 */
export function Modal({ titulo, abierto, onCerrar, children, tamano = "normal" }: {
  titulo: string;
  abierto: boolean;
  onCerrar: () => void;
  children: ReactNode;
  /** normal = 600 px (A03); compacto = 480 px (N08). */
  tamano?: "normal" | "compacto";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) {
      dialogo.showModal();
      // showModal() lleva el foco al primer botón (Cerrar); mejor al primer campo, si lo hay.
      dialogo.querySelector<HTMLElement>("input:not([disabled]):not([type=hidden]):not(.sr-only), select, textarea")?.focus();
    }
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && onCerrar()}
      aria-labelledby="modal-titulo"
      className={`m-auto max-w-[calc(100vw-32px)] rounded-[20px] bg-white p-0 text-neutro-texto shadow-tarjeta backdrop:bg-black/40 ${tamano === "normal" ? "w-[600px]" : "w-[480px]"}`}
    >
      <div className={`flex flex-col ${tamano === "normal" ? "gap-4 px-8 py-7" : "gap-3.5 px-7 py-6"}`}>
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
