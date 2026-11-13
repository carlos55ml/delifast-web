"use client";

import { useState, type ReactNode } from "react";
import { Boton } from "./Boton";
import { Modal } from "./Modal";

/** Confirmación de una acción que no se puede deshacer (borrar un producto, una categoría...). */
export function ModalConfirmar({ titulo, abierto, onCerrar, onConfirmar, textoConfirmar = "Borrar", children }: {
  titulo: string;
  abierto: boolean;
  onCerrar: () => void;
  /** Lanza un Error con el mensaje a mostrar si falla. */
  onConfirmar: () => Promise<void>;
  textoConfirmar?: string;
  children: ReactNode;
}) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string>();

  async function confirmar() {
    setEnviando(true);
    setError(undefined);
    try {
      await onConfirmar();
      onCerrar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={titulo} abierto={abierto} onCerrar={() => { setError(undefined); onCerrar(); }} tamano="compacto">
      <div className="texto-normal text-neutro-texto-secundario">{children}</div>
      {error && <p role="alert" className="texto-pequeno text-estado-error">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Boton tipo="fantasma" onClick={onCerrar}>Cancelar</Boton>
        <Boton tipo="peligro" onClick={confirmar} disabled={enviando}>{enviando ? "Borrando…" : textoConfirmar}</Boton>
      </div>
    </Modal>
  );
}
