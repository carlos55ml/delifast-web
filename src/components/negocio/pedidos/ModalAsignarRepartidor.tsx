"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Modal } from "@/components/ui/Modal";
import { EstadoTabla } from "@/components/ui/Tarjeta";
import { ErrorApi, api, datos } from "@/lib/api/client";
import type { PedidoNegocio, RepartidorNegocio } from "@/lib/api/tipos";
import { codigoCorto, iniciales } from "@/lib/formato";
import { useConsulta } from "@/lib/useConsulta";

/**
 * N08 Asignar repartidor (RF-20): el negocio elige uno de sus repartidores activos y
 * disponibles y el pedido pasa de LISTO a EN_REPARTO (arquitectura 5.4).
 */
export function ModalAsignarRepartidor({ pedido, onCerrar, onAsignado }: {
  pedido?: PedidoNegocio;
  onCerrar: () => void;
  onAsignado: (pedido: PedidoNegocio) => void;
}) {
  return (
    <Modal titulo="Asignar repartidor" abierto={!!pedido} onCerrar={onCerrar} tamano="compacto">
      {pedido && <Contenido key={pedido.id} pedido={pedido} onCerrar={onCerrar} onAsignado={onAsignado} />}
    </Modal>
  );
}

function Contenido({ pedido, onCerrar, onAsignado }: { pedido: PedidoNegocio; onCerrar: () => void; onAsignado: (p: PedidoNegocio) => void }) {
  const { datos: repartidores, error, recargar } = useConsulta(
    () => datos(api.GET("/negocio/repartidores", { params: { query: { disponible: true } } })),
    [pedido.id],
  );
  const [elegido, setElegido] = useState<string>();
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string>();
  // Primero los que menos pedidos llevan encima, y ese elegido por defecto (como en el prototipo).
  const ordenados = repartidores && [...repartidores].sort((a, b) => a.pedidosEnReparto - b.pedidosEnReparto || a.nombre.localeCompare(b.nombre, "es"));
  const seleccionado = elegido ?? ordenados?.[0]?.id;

  async function asignar() {
    if (!seleccionado) return;
    setEnviando(true);
    setErrorEnvio(undefined);
    try {
      onAsignado(await datos(api.POST("/pedidos/{id}/asignar", { params: { path: { id: pedido.id } }, body: { repartidorId: seleccionado } })));
    } catch (e) {
      setErrorEnvio((e as Error).message);
      // 422: ese repartidor ya no está disponible; se vuelve a pedir la lista.
      if (e instanceof ErrorApi && e.status === 422) {
        setElegido(undefined);
        recargar();
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <p className="texto-pequeno text-neutro-texto-secundario">
        Pedido {codigoCorto(pedido.codigo)} · {pedido.cliente.nombre} · {pedido.direccionEntrega.replace(/ · [^·]+$/, "")}
      </p>

      {error && !repartidores && <EstadoTabla error onReintentar={recargar}>No se han podido cargar los repartidores.</EstadoTabla>}
      {!error && !repartidores && <p className="py-4 texto-pequeno text-neutro-texto-secundario">Cargando repartidores…</p>}
      {repartidores?.length === 0 && (
        <p className="rounded-xl bg-neutro-fondo px-4 py-3 texto-normal text-neutro-texto-secundario">
          Ahora mismo no hay repartidores disponibles. Cada repartidor se marca como disponible desde su perfil.
        </p>
      )}

      {ordenados && ordenados.length > 0 && (
        <fieldset className="flex flex-col gap-3.5">
          <legend className="sr-only">Repartidor</legend>
          {ordenados.map((r) => (
            <OpcionRepartidor key={r.id} repartidor={r} seleccionado={r.id === seleccionado} onElegir={() => setElegido(r.id)} />
          ))}
        </fieldset>
      )}
      <p className="texto-pequeno text-neutro-texto-secundario">Solo aparecen los repartidores activos.</p>

      {errorEnvio && <p role="alert" className="texto-pequeno text-estado-error">{errorEnvio}</p>}

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Boton tipo="fantasma" onClick={onCerrar}>Cancelar</Boton>
        <Boton onClick={asignar} disabled={!seleccionado || enviando}>{enviando ? "Asignando…" : "Asignar y pasar a En reparto"}</Boton>
      </div>
    </>
  );
}

function OpcionRepartidor({ repartidor, seleccionado, onElegir }: { repartidor: RepartidorNegocio; seleccionado: boolean; onElegir: () => void }) {
  const carga = repartidor.pedidosEnReparto === 0 ? "sin pedidos en reparto" : `${repartidor.pedidosEnReparto} ${repartidor.pedidosEnReparto === 1 ? "pedido" : "pedidos"} en reparto`;
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-marca-rojo ${
        seleccionado ? "border-2 border-marca-rojo bg-marca-rojo-claro px-[13px] py-[11px]" : "border border-neutro-borde hover:bg-neutro-fondo"
      }`}
    >
      <input type="radio" name="repartidor" value={repartidor.id} checked={seleccionado} onChange={onElegir} className="sr-only" />
      <span aria-hidden className={`flex size-9 shrink-0 items-center justify-center rounded-full texto-destacado text-marca-rojo ${seleccionado ? "bg-white" : "bg-neutro-fondo"}`}>
        {iniciales(repartidor.nombre)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="texto-destacado">{repartidor.nombre}</span>
        <span className={`texto-pequeno ${repartidor.pedidosEnReparto === 0 ? "text-estado-exito-texto" : "text-neutro-texto-secundario"}`}>Disponible · {carga}</span>
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- selección SVG de Figma */}
      <img src={seleccionado ? "/iconos/radio-activo.svg" : "/iconos/radio.svg"} alt="" width={20} height={20} aria-hidden className="block size-5 shrink-0" />
    </label>
  );
}
