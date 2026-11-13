"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { HojaInferior } from "@/components/ui/HojaInferior";
import { Icono } from "@/components/ui/Icono";
import { api, datos } from "@/lib/api/client";
import type { MetodoPago, RepartoRepartidor } from "@/lib/api/tipos";
import { codigoCorto, euros } from "@/lib/formato";

/** R03 Confirmar entrega y cobro (RF-25). Por defecto, el método que eligió el cliente. */
export function HojaConfirmarEntrega({ reparto, abierta, onCerrar, onEntregado }: {
  reparto: RepartoRepartidor;
  abierta: boolean;
  onCerrar: () => void;
  onEntregado: (r: RepartoRepartidor) => void;
}) {
  const [metodo, setMetodo] = useState<MetodoPago>(reparto.pedido.metodoPago);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string>();

  async function confirmar() {
    setEnviando(true);
    setError(undefined);
    try {
      onEntregado(await datos(api.POST("/repartos/{id}/entregar", { params: { path: { id: reparto.id } }, body: { metodoCobro: metodo } })));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  const opcion = (valor: MetodoPago, texto: string, icono: "efectivo" | "tarjeta") => {
    const activa = metodo === valor;
    return (
      <label
        className={`flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-[14px] py-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-marca-rojo ${
          activa ? "border-2 border-marca-rojo bg-marca-rojo-claro py-[15px] text-marca-rojo" : "border border-neutro-borde"
        }`}
      >
        <input type="radio" name="metodo-cobro" value={valor} checked={activa} onChange={() => setMetodo(valor)} className="sr-only" />
        <Icono nombre={activa ? `${icono}-activo` : icono} />
        <span className="texto-destacado">{texto}</span>
      </label>
    );
  };

  return (
    <HojaInferior abierta={abierta} onCerrar={onCerrar} etiquetadaPor="titulo-entrega">
      <h2 id="titulo-entrega" className="texto-titulo-l">Confirmar entrega</h2>
      <p className="texto-pequeno text-neutro-texto-secundario">Pedido {codigoCorto(reparto.pedido.codigo)} · {reparto.pedido.cliente.nombre}</p>
      <div className="flex flex-col items-center gap-0.5 rounded-[14px] bg-neutro-fondo py-3">
        <span className="texto-pequeno text-neutro-texto-secundario">Importe a cobrar</span>
        <span className="texto-titulo-xl">{euros(reparto.pedido.total)}</span>
      </div>
      <fieldset className="flex flex-col gap-4">
        <legend className="pb-4 texto-subtitulo">¿Cómo ha pagado el cliente?</legend>
        <div className="flex gap-3">
          {opcion("EFECTIVO", "Efectivo", "efectivo")}
          {opcion("TARJETA", "Tarjeta", "tarjeta")}
        </div>
      </fieldset>
      {error && <p role="alert" className="texto-pequeno text-estado-error">{error}</p>}
      <Boton tamano="grande" className="mt-4" onClick={confirmar} disabled={enviando}>{enviando ? "Guardando…" : "Entregado y cobrado"}</Boton>
    </HojaInferior>
  );
}
