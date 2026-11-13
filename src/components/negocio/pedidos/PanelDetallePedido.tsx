"use client";

import { useState, type ReactNode } from "react";
import { Boton } from "@/components/ui/Boton";
import { Chip } from "@/components/ui/Chip";
import { EtiquetaEstado } from "@/components/ui/EtiquetaEstado";
import { Icono } from "@/components/ui/Icono";
import { PanelLateral } from "@/components/ui/PanelLateral";
import { api, datos } from "@/lib/api/client";
import type { PedidoNegocio } from "@/lib/api/tipos";
import { TEXTO_ESTADO_PEDIDO, TEXTO_METODO_PAGO, codigoCorto, euros, hora } from "@/lib/formato";

const TIEMPOS = [15, 25, 35, 45];

/**
 * N02 Detalle del pedido: datos del cliente, productos, totales y la acción de su estado.
 * RECIBIDO: elegir tiempo estimado y aceptar, o rechazar con motivo (RF-15). Después muestra el
 * historial de estados con sus horas (RF-16) y el siguiente paso.
 */
export function PanelDetallePedido({ pedido, ocupado, onCerrar, onAccion, onAsignar }: {
  pedido?: PedidoNegocio;
  ocupado: boolean;
  onCerrar: () => void;
  onAccion: (id: number, accion: () => Promise<PedidoNegocio>) => Promise<boolean>;
  onAsignar: (id: number) => void;
}) {
  return (
    <PanelLateral abierto={!!pedido} onCerrar={onCerrar} etiquetadoPor="detalle-pedido-titulo">
      {/* key: al cambiar de pedido se reinician el tiempo elegido y el rechazo */}
      {pedido && <Contenido key={pedido.id} pedido={pedido} ocupado={ocupado} onCerrar={onCerrar} onAccion={onAccion} onAsignar={onAsignar} />}
    </PanelLateral>
  );
}

function Contenido({ pedido, ocupado, onCerrar, onAccion, onAsignar }: Parameters<typeof PanelDetallePedido>[0] & { pedido: PedidoNegocio }) {
  const [tiempo, setTiempo] = useState(25);
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const id = pedido.id;
  const ruta = { params: { path: { id } } };

  const aceptar = async () => {
    if (await onAccion(id, () => datos(api.POST("/pedidos/{id}/aceptar", { ...ruta, body: { tiempoEstimadoMin: tiempo } })))) onCerrar();
  };
  const rechazar = async () => {
    if (await onAccion(id, () => datos(api.POST("/pedidos/{id}/rechazar", { ...ruta, body: { motivo: motivo.trim() } })))) onCerrar();
  };
  const listo = () => onAccion(id, () => datos(api.POST("/pedidos/{id}/listo", ruta)));

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="detalle-pedido-titulo" className="texto-titulo-l">Pedido {codigoCorto(pedido.codigo)}</h2>
          <p className="texto-pequeno text-neutro-texto-secundario">Recibido a las {hora(pedido.fechaCreacion)}</p>
        </div>
        <div className="flex items-center gap-3">
          <EtiquetaEstado estado={pedido.estado} />
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-marca-rojo">
            <Icono nombre="cerrar" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 rounded-xl bg-neutro-fondo px-4 py-3.5">
        <p className="texto-destacado">{pedido.cliente.nombre}</p>
        <p className="flex items-center gap-2.5 texto-normal">
          <Icono nombre="telefono" />
          <a href={`tel:${pedido.telefonoContacto.replace(/\s/g, "")}`} className="hover:underline">{pedido.telefonoContacto}</a>
        </p>
        <p className="flex items-center gap-2.5 texto-normal">
          <Icono nombre="ubicacion" />
          {pedido.direccionEntrega}
        </p>
      </div>

      <h3 className="texto-subtitulo">Productos</h3>
      {pedido.lineas.map((l, i) => (
        <Fila key={i} izquierda={`${l.cantidad}× ${l.nombreProducto}`} derecha={euros(l.importe)} />
      ))}
      {pedido.nota && (
        <p className="flex items-center gap-2.5 rounded-[10px] bg-estado-nota-fondo px-3 py-2.5 texto-normal">
          <Icono nombre="nota" />
          Nota: {pedido.nota}
        </p>
      )}

      <div className="h-px w-full bg-neutro-borde" />
      <Fila izquierda="Subtotal" derecha={euros(pedido.subtotal)} />
      <Fila izquierda="Gastos de envío" derecha={euros(pedido.gastosEnvio)} />
      <Fila izquierda="Total" derecha={euros(pedido.total)} destacada />
      <Fila izquierda="Pago" derecha={`${TEXTO_METODO_PAGO[pedido.metodoPago]}, al repartidor`} pequena />
      <div className="h-px w-full bg-neutro-borde" />

      {pedido.estado === "RECIBIDO" ? (
        rechazando ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="motivo-rechazo" className="texto-subtitulo">Motivo del rechazo</label>
            <p className="texto-pequeno text-neutro-texto-secundario">Lo verá el cliente en la app.</p>
            <textarea
              id="motivo-rechazo"
              autoFocus
              rows={3}
              maxLength={300}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Por ejemplo: nos hemos quedado sin pan de hamburguesa."
              className="w-full resize-none rounded-xl border border-neutro-borde px-4 py-3 texto-normal outline-none placeholder:text-neutro-texto-secundario focus:border-2 focus:border-marca-rojo focus:px-[15px] focus:py-[11px]"
            />
          </div>
        ) : (
          <>
            <h3 id="tiempo-estimado" className="texto-subtitulo">Tiempo estimado</h3>
            <div role="group" aria-labelledby="tiempo-estimado" className="flex flex-wrap gap-2">
              {TIEMPOS.map((t) => (
                <Chip key={t} texto={`${t} min`} seleccionado={tiempo === t} onClick={() => setTiempo(t)} />
              ))}
            </div>
          </>
        )
      ) : (
        <Historial pedido={pedido} />
      )}

      <div className="flex-1" />

      <div className="flex gap-3">
        {pedido.estado === "RECIBIDO" && !rechazando && (
          <>
            <Boton tipo="peligro" className="flex-1" disabled={ocupado} onClick={() => setRechazando(true)}>Rechazar</Boton>
            <Boton className="flex-1" disabled={ocupado} onClick={aceptar}>{ocupado ? "Guardando…" : "Aceptar pedido"}</Boton>
          </>
        )}
        {pedido.estado === "RECIBIDO" && rechazando && (
          <>
            <Boton tipo="fantasma" className="flex-1" disabled={ocupado} onClick={() => setRechazando(false)}>Volver</Boton>
            <Boton tipo="peligro" className="flex-1" disabled={ocupado || !motivo.trim()} onClick={rechazar}>{ocupado ? "Guardando…" : "Rechazar pedido"}</Boton>
          </>
        )}
        {pedido.estado === "EN_PREPARACION" && (
          <Boton className="flex-1" disabled={ocupado} onClick={listo}>{ocupado ? "Guardando…" : "Marcar como listo"}</Boton>
        )}
        {pedido.estado === "LISTO" && (
          <Boton className="flex-1" onClick={() => onAsignar(id)}>Asignar repartidor</Boton>
        )}
      </div>
    </>
  );
}

function Fila({ izquierda, derecha, destacada, pequena }: { izquierda: ReactNode; derecha: ReactNode; destacada?: boolean; pequena?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${destacada ? "texto-destacado" : pequena ? "texto-pequeno" : "texto-normal"}`}>
      <span>{izquierda}</span>
      <span className="shrink-0 text-right">{derecha}</span>
    </div>
  );
}

/** Historial de estados con hora y autor (RF-16), más el tiempo estimado y el repartidor. */
function Historial({ pedido }: { pedido: PedidoNegocio }) {
  return (
    <section aria-labelledby="historial-titulo" className="flex flex-col gap-2.5">
      <h3 id="historial-titulo" className="texto-subtitulo">Historial</h3>
      <ol className="flex flex-col gap-2">
        {pedido.historial.map((c, i) => (
          <li key={i} className="flex items-center justify-between gap-4 texto-normal">
            <span className="flex items-center gap-2">
              <span aria-hidden className="size-2 rounded-full bg-neutro-borde" />
              {TEXTO_ESTADO_PEDIDO[c.estadoNuevo]}
              {c.autor && <span className="texto-pequeno text-neutro-texto-secundario">· {c.autor}</span>}
            </span>
            <time dateTime={c.fecha} className="texto-pequeno text-neutro-texto-secundario">{hora(c.fecha)}</time>
          </li>
        ))}
      </ol>
      {pedido.tiempoEstimadoMin && <p className="texto-pequeno text-neutro-texto-secundario">Tiempo estimado: {pedido.tiempoEstimadoMin} min</p>}
      {pedido.reparto && <p className="texto-pequeno text-neutro-texto-secundario">Repartidor: {pedido.reparto.repartidor.nombre}</p>}
    </section>
  );
}
