"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Hoja que sube desde abajo (R03, R04): esquinas de 24 px y asa. <dialog> nativo, como Modal.
 */
export function HojaInferior({ abierta, onCerrar, etiquetadaPor, children }: {
  abierta: boolean;
  onCerrar: () => void;
  etiquetadaPor: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierta && !dialogo.open) dialogo.showModal();
    if (!abierta && dialogo.open) dialogo.close();
  }, [abierta]);

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && onCerrar()}
      aria-labelledby={etiquetadaPor}
      className="fixed inset-x-0 top-auto bottom-0 mx-auto mb-0 w-full max-w-[430px] rounded-t-3xl bg-white p-0 text-neutro-texto backdrop:bg-black/40"
    >
      <div className="flex flex-col gap-4 px-6 pt-3 pb-8">
        <span aria-hidden className="mx-auto block h-1 w-10 rounded-sm bg-neutro-borde" />
        {children}
      </div>
    </dialog>
  );
}
