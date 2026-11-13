"use client";

import { useState, type FormEvent } from "react";
import { Boton } from "@/components/ui/Boton";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { Modal } from "@/components/ui/Modal";
import { api, datos, erroresPorCampo } from "@/lib/api/client";
import type { CategoriaCarta } from "@/lib/api/tipos";

/** Crear o renombrar una categoría de la carta. */
export function FormularioCategoria({ abierto, categoria, onCerrar, onGuardada }: {
  abierto: boolean;
  categoria?: CategoriaCarta;
  onCerrar: () => void;
  onGuardada: (categoria: CategoriaCarta) => void;
}) {
  const [error, setError] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nombre = String(new FormData(evento.currentTarget).get("nombre") ?? "").trim();
    if (!nombre) return setError("Escribe el nombre de la categoría");
    setEnviando(true);
    setError(undefined);
    try {
      onGuardada(
        categoria
          ? await datos(api.PUT("/negocio/categorias/{id}", { params: { path: { id: categoria.id } }, body: { nombre } }))
          : await datos(api.POST("/negocio/categorias", { body: { nombre } })),
      );
    } catch (e) {
      setError(erroresPorCampo(e)?.nombre ?? (e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={categoria ? "Renombrar categoría" : "Nueva categoría"} abierto={abierto} onCerrar={onCerrar} tamano="compacto">
      <form key={`${abierto}-${categoria?.id}`} onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <CampoTexto etiqueta="Nombre" name="nombre" defaultValue={categoria?.nombre} placeholder="Hamburguesas" maxLength={60} error={error} autoFocus />
        <div className="flex justify-end gap-3">
          <Boton tipo="fantasma" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" disabled={enviando}>{enviando ? "Guardando…" : categoria ? "Guardar" : "Crear categoría"}</Boton>
        </div>
      </form>
    </Modal>
  );
}
