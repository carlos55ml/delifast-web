"use client";

import { useEffect, useRef, useState } from "react";
import { useFechaDeHoy } from "@/components/panel/Cabecera";
import { EtiquetaEstado } from "@/components/ui/EtiquetaEstado";
import { EstadoTabla } from "@/components/ui/Tarjeta";
import { ErrorApi, api, datos } from "@/lib/api/client";
import type { EstadoPedido, PedidoNegocio } from "@/lib/api/tipos";
import { sonarAvisoPedido } from "@/lib/avisoSonoro";
import { codigoCorto, fechaLarga, hora, plural } from "@/lib/formato";
import { escucharPedidosNegocio } from "@/lib/tiempoReal";
import { useConsulta } from "@/lib/useConsulta";
import { CabeceraNegocio } from "../CabeceraNegocio";
import { useNegocio } from "../NegocioContexto";
import { ModalAsignarRepartidor } from "./ModalAsignarRepartidor";
import { PanelDetallePedido } from "./PanelDetallePedido";
import { TarjetaPedido } from "./TarjetaPedido";

const COLUMNAS: { estado: EstadoPedido; vacia: string }[] = [
  { estado: "RECIBIDO", vacia: "No hay pedidos nuevos" },
  { estado: "EN_PREPARACION", vacia: "No hay pedidos en preparación" },
  { estado: "LISTO", vacia: "No hay pedidos listos" },
  { estado: "EN_REPARTO", vacia: "No hay pedidos en reparto" },
];

/** Un pedido RECIBIDO de hace menos de esto, aún sin abrir, sale como "Nuevo". */
const NUEVO_MS = 5 * 60_000;
/** Red de seguridad por si se corta el WebSocket de Realtime. */
const RECARGA_MS = 60_000;

/** N01 / N01b: tablero de pedidos en tiempo real (RF-14, RF-15, RF-16, RF-20). */
export function VistaPedidos() {
  const hoy = useFechaDeHoy();
  const { negocio, recargar: recargarNegocio } = useNegocio();
  const { datos: pedidos, error, cargando, recargar, fijar } = useConsulta(() => datos(api.GET("/negocio/pedidos")), []);

  const [abierto, setAbierto] = useState<number>();
  const [asignando, setAsignando] = useState<number>();
  const [ocupado, setOcupado] = useState<number>();
  const [errorAccion, setErrorAccion] = useState<string>();
  const [anuncio, setAnuncio] = useState("");
  const { nuevos, quitarNuevo } = usePedidosNuevos(pedidos, hoy, setAnuncio);

  // Realtime: cualquier cambio en los pedidos del negocio vuelve a cargar el tablero.
  const negocioId = negocio?.id;
  useEffect(() => {
    if (negocioId === undefined) return;
    const dejar = escucharPedidosNegocio(negocioId, () => {
      recargar();
      recargarNegocio();
    });
    const intervalo = setInterval(recargar, RECARGA_MS);
    return () => {
      dejar();
      clearInterval(intervalo);
    };
  }, [negocioId, recargar, recargarNegocio]);

  /** Sustituye el pedido devuelto por la API en el tablero (o lo quita si ya no está activo). */
  function actualizar(pedido: PedidoNegocio) {
    fijar((lista = []) =>
      COLUMNAS.some((c) => c.estado === pedido.estado)
        ? lista.map((p) => (p.id === pedido.id ? pedido : p))
        : lista.filter((p) => p.id !== pedido.id),
    );
  }

  /** Ejecuta una acción sobre un pedido; si otra persona se adelantó (409), recarga. */
  async function ejecutar(id: number, accion: () => Promise<PedidoNegocio>) {
    setOcupado(id);
    setErrorAccion(undefined);
    try {
      actualizar(await accion());
      return true;
    } catch (e) {
      setErrorAccion((e as Error).message);
      if (e instanceof ErrorApi && (e.status === 409 || e.status === 404)) recargar();
      return false;
    } finally {
      setOcupado(undefined);
    }
  }

  const abrir = (id: number) => {
    quitarNuevo(id);
    setAbierto(id);
  };

  const pedidoAbierto = pedidos?.find((p) => p.id === abierto);
  const pedidoAsignando = pedidos?.find((p) => p.id === asignando);
  const subtitulo = hoy && [fechaLarga(hoy, { conAnio: false }), negocio && plural(negocio.pedidosHoy, "pedido hoy", "pedidos hoy")].filter(Boolean).join(" · ");

  return (
    <>
      <CabeceraNegocio titulo="Pedidos" subtitulo={subtitulo} />
      <main className="flex min-h-0 flex-1 flex-col gap-3 px-8 py-7">
        <p aria-live="assertive" className="sr-only">{anuncio}</p>
        {errorAccion && (
          <p role="alert" className="rounded-[10px] bg-marca-rojo-claro px-4 py-2.5 texto-pequeno text-estado-error">
            {errorAccion}
          </p>
        )}
        {error && !pedidos ? (
          <EstadoTabla error onReintentar={recargar}>No se han podido cargar los pedidos. {error.message}</EstadoTabla>
        ) : (
          <div className="grid min-h-[480px] flex-1 auto-cols-[minmax(240px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2" aria-busy={cargando && !pedidos}>
            {COLUMNAS.map(({ estado, vacia }) => {
              // Como en el prototipo, lo más reciente arriba.
              const columna = (pedidos ?? []).filter((p) => p.estado === estado).sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
              return (
                <section key={estado} aria-label={`Columna ${estado.toLowerCase().replace("_", " ")}`} className="flex flex-col gap-3 rounded-2xl bg-neutro-columna p-3">
                  <div className="flex items-center justify-between">
                    <EtiquetaEstado estado={estado} />
                    <span className="texto-destacado text-neutro-texto-secundario">{pedidos ? columna.length : ""}</span>
                  </div>
                  {!pedidos && <p className="texto-pequeno text-neutro-texto-secundario">Cargando…</p>}
                  {pedidos && columna.length === 0 && <p className="texto-pequeno text-neutro-texto-secundario">{vacia}</p>}
                  {columna.map((pedido) => (
                    <TarjetaPedido
                      key={pedido.id}
                      pedido={pedido}
                      nuevo={nuevos.has(pedido.id)}
                      ocupado={ocupado === pedido.id}
                      onAbrir={() => abrir(pedido.id)}
                      accion={
                        estado === "RECIBIDO"
                          ? { texto: "Ver pedido", ejecutar: () => abrir(pedido.id) }
                          : estado === "EN_PREPARACION"
                            ? { texto: "Marcar como listo", ejecutar: () => ejecutar(pedido.id, () => datos(api.POST("/pedidos/{id}/listo", { params: { path: { id: pedido.id } } }))) }
                            : estado === "LISTO"
                              ? { texto: "Asignar repartidor", ejecutar: () => setAsignando(pedido.id) }
                              : undefined
                      }
                    />
                  ))}
                  {pedidos && <PieColumna estado={estado} pedidos={columna} />}
                </section>
              );
            })}
          </div>
        )}
      </main>

      <PanelDetallePedido
        pedido={pedidoAbierto}
        onCerrar={() => setAbierto(undefined)}
        ocupado={ocupado === abierto}
        onAccion={ejecutar}
        onAsignar={(id) => {
          setAbierto(undefined);
          setAsignando(id);
        }}
      />
      <ModalAsignarRepartidor
        pedido={pedidoAsignando}
        onCerrar={() => setAsignando(undefined)}
        onAsignado={(pedido) => {
          actualizar(pedido);
          setAsignando(undefined);
        }}
      />
    </>
  );
}

/** Texto bajo las columnas de Listo y En reparto, como en N01 y N01b. */
function PieColumna({ estado, pedidos }: { estado: EstadoPedido; pedidos: PedidoNegocio[] }) {
  if (pedidos.length === 0) return null;
  let texto: string | undefined;
  if (estado === "LISTO") texto = "Asigna un repartidor para enviarlo";
  if (estado === "EN_REPARTO") {
    const [unico] = pedidos;
    texto =
      pedidos.length === 1 && unico?.reparto
        ? `${unico.reparto.repartidor.nombre} · salió a las ${hora(unico.reparto.fechaAsignacion)}`
        : pedidos.map((p) => `${codigoCorto(p.codigo)} ${p.reparto?.repartidor.nombre ?? ""}`.trim()).join(" · ");
  }
  return texto ? <p className="texto-pequeno text-neutro-texto-secundario">{texto}</p> : null;
}

/**
 * Pedidos que se marcan como "Nuevo": los RECIBIDO recientes al abrir el tablero y los que
 * llegan después (con aviso sonoro y anuncio para lectores de pantalla). Dejan de serlo al abrirlos.
 */
function usePedidosNuevos(pedidos: PedidoNegocio[] | undefined, hoy: Date | undefined, anunciar: (texto: string) => void) {
  const [nuevos, setNuevos] = useState<Set<number>>(new Set());
  const conocidos = useRef<Set<number>>(undefined);

  useEffect(() => {
    if (!pedidos || !hoy) return;
    const recibidos = pedidos.filter((p) => p.estado === "RECIBIDO");
    if (!conocidos.current) {
      // Primera carga: solo los recientes.
      const recientes = recibidos.filter((p) => hoy.getTime() - new Date(p.fechaCreacion).getTime() < NUEVO_MS);
      setNuevos(new Set(recientes.map((p) => p.id)));
    } else {
      const llegados = recibidos.filter((p) => !conocidos.current!.has(p.id));
      if (llegados.length) {
        setNuevos((n) => new Set([...n, ...llegados.map((p) => p.id)]));
        sonarAvisoPedido();
        anunciar(llegados.map((p) => `Nuevo pedido ${codigoCorto(p.codigo)} de ${p.cliente.nombre}`).join(". "));
      }
    }
    conocidos.current = new Set(pedidos.map((p) => p.id));
  }, [pedidos, hoy, anunciar]);

  const quitarNuevo = (id: number) =>
    setNuevos((n) => {
      if (!n.has(id)) return n;
      const copia = new Set(n);
      copia.delete(id);
      return copia;
    });

  return { nuevos, quitarNuevo };
}
