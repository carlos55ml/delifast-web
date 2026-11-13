"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Chip } from "@/components/ui/Chip";
import { HojaInferior } from "@/components/ui/HojaInferior";
import { api, datos } from "@/lib/api/client";
import type { RepartoRepartidor, TipoIncidencia } from "@/lib/api/tipos";
import { codigoCorto } from "@/lib/formato";

/** Tipos que ofrece R04 al repartidor ("Pedido dañado" = producto en mal estado). */
const TIPOS: { valor: TipoIncidencia; texto: string }[] = [
  { valor: "CLIENTE_AUSENTE", texto: "Cliente ausente" },
  { valor: "DIRECCION_INCORRECTA", texto: "Dirección incorrecta" },
  { valor: "PRODUCTO_MAL_ESTADO", texto: "Pedido dañado" },
  { valor: "OTRA", texto: "Otro" },
];

/** R04 Comunicar incidencia de reparto (RF-26): el negocio la recibe en N05 al momento. */
export function HojaIncidencia({ reparto, abierta, onCerrar, onEnviada }: {
  reparto: RepartoRepartidor;
  abierta: boolean;
  onCerrar: () => void;
  onEnviada: () => void;
}) {
  const [tipo, setTipo] = useState<TipoIncidencia>("CLIENTE_AUSENTE");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string>();

  async function enviar() {
    if (tipo === "OTRA" && !descripcion.trim()) return setError("Cuenta brevemente qué ha pasado.");
    setEnviando(true);
    setError(undefined);
    try {
      await datos(api.POST("/repartos/{id}/incidencias", { params: { path: { id: reparto.id } }, body: { tipo, descripcion: descripcion.trim() || null } }));
      setDescripcion("");
      onEnviada();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <HojaInferior abierta={abierta} onCerrar={onCerrar} etiquetadaPor="titulo-incidencia">
      <h2 id="titulo-incidencia" className="texto-titulo-l">Comunicar incidencia</h2>
      <p className="texto-pequeno text-neutro-texto-secundario">Pedido {codigoCorto(reparto.pedido.codigo)} · el negocio la recibe al momento</p>
      <h3 id="tipo-incidencia" className="texto-subtitulo">¿Qué ha pasado?</h3>
      <div role="group" aria-labelledby="tipo-incidencia" className="flex flex-wrap gap-2">
        {TIPOS.map((t) => <Chip key={t.valor} texto={t.texto} seleccionado={tipo === t.valor} onClick={() => setTipo(t.valor)} />)}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="descripcion-incidencia" className="texto-etiqueta text-neutro-texto-secundario">Descripción {tipo === "OTRA" ? "" : "(opcional)"}</label>
        <textarea
          id="descripcion-incidencia"
          rows={2}
          maxLength={500}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="He llamado dos veces y no contesta."
          className="w-full resize-none rounded-xl border border-neutro-borde px-4 py-3 texto-normal outline-none placeholder:text-neutro-texto-secundario focus:border-2 focus:border-marca-rojo focus:px-[15px] focus:py-[11px]"
        />
      </div>
      {error && <p role="alert" className="texto-pequeno text-estado-error">{error}</p>}
      <Boton tamano="grande" className="mt-4" onClick={enviar} disabled={enviando}>{enviando ? "Enviando…" : "Enviar incidencia"}</Boton>
      <Boton tipo="fantasma" className="w-full" onClick={onCerrar}>Cancelar</Boton>
    </HojaInferior>
  );
}
