"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Boton } from "./Boton";

const TIPOS = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

/**
 * Elegir una foto o un logo (arquitectura 5.5): comprueba en el navegador tipo y tamaño para
 * avisar antes de enviar, aunque quien manda es la validación del backend.
 * `vista` dibuja la imagen actual o la elegida (URL) o el hueco vacío (undefined).
 */
export function SelectorImagen({ actual, texto, onCambio, vista, error: errorExterno, permitirQuitar }: {
  actual?: string | null;
  texto: string;
  onCambio: (cambio: { archivo?: File; quitar: boolean }) => void;
  vista: (url: string | undefined) => ReactNode;
  error?: string;
  permitirQuitar?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<string>();
  const [quitada, setQuitada] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa); }, [previa]);

  function elegir(archivo: File | undefined) {
    if (!archivo) return;
    if (!TIPOS.includes(archivo.type)) return setError("Tiene que ser una imagen JPEG, PNG o WebP.");
    if (archivo.size > MAX_BYTES) return setError("La imagen no puede pasar de 2 MB.");
    setError(undefined);
    setQuitada(false);
    setPrevia(URL.createObjectURL(archivo));
    onCambio({ archivo, quitar: false });
  }

  function quitar() {
    setPrevia(undefined);
    setQuitada(true);
    if (input.current) input.current.value = "";
    onCambio({ quitar: true });
  }

  const url = previa ?? (quitada ? undefined : (actual ?? undefined));
  const mensaje = error ?? errorExterno;

  return (
    <div className="flex items-center gap-4">
      {vista(url)}
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2">
          <Boton tipo="fantasma" onClick={() => input.current?.click()} aria-describedby={`${id}-ayuda`}>{texto}</Boton>
          {permitirQuitar && url && <Boton tipo="fantasma" onClick={quitar}>Quitar</Boton>}
        </div>
        <input ref={input} id={id} type="file" accept={TIPOS.join(",")} className="sr-only" tabIndex={-1} onChange={(e) => elegir(e.target.files?.[0])} />
        <p id={`${id}-ayuda`} className={`texto-pequeno ${mensaje ? "text-estado-error" : "text-neutro-texto-secundario"}`} role={mensaje ? "alert" : undefined}>
          {mensaje ?? "JPG, PNG o WebP · máximo 2 MB"}
        </p>
      </div>
    </div>
  );
}
