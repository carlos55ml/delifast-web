"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Superposición que entra por la derecha con fondo oscuro (N02 en Figma). Como Modal, usa
 * <dialog> nativo: Escape cierra y el foco queda dentro. `etiquetadoPor` es el id del título.
 */
export function PanelLateral({ abierto, onCerrar, etiquetadoPor, children }: {
  abierto: boolean;
  onCerrar: () => void;
  etiquetadoPor: string;
  children: ReactNode;
}) {
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
      aria-labelledby={etiquetadoPor}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-[480px] max-w-full bg-white p-0 text-neutro-texto backdrop:bg-black/40"
    >
      <div className="flex min-h-full flex-col gap-[18px] px-7 py-6">{children}</div>
    </dialog>
  );
}
