"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { EtiquetaEstado } from "@/components/ui/EtiquetaEstado";
import { Icono } from "@/components/ui/Icono";
import { EstadoTabla } from "@/components/ui/Tarjeta";
import { api, datos } from "@/lib/api/client";
import type { RepartoRepartidor } from "@/lib/api/tipos";
import { codigoCorto, euros, hora } from "@/lib/formato";
import { useConsulta } from "@/lib/useConsulta";
import { CabeceraMovil } from "./CabeceraMovil";
import { HojaConfirmarEntrega } from "./HojaConfirmarEntrega";
import { HojaIncidencia } from "./HojaIncidencia";
import { MapaReparto } from "./MapaReparto";
import { usePerfilRepartidor } from "./PerfilContexto";

const tarjeta = "flex flex-col gap-2.5 rounded-2xl bg-white px-4 py-3.5 shadow-tarjeta";

/** Enlace de navegación (RF-24): con coordenadas, al punto; si no, buscando la dirección. */
function enlaceRuta(r: RepartoRepartidor): string {
  const { latitud, longitud, direccionEntrega } = r.pedido;
  const destino = typeof latitud === "number" && typeof longitud === "number" ? `${latitud},${longitud}` : direccionEntrega.replace(" · ", ", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}&travelmode=driving`;
}

/** R02 Detalle del pedido: mapa, cliente, productos, cobro y acciones (RF-24, RF-25, RF-26). */
export function VistaDetalleReparto() {
  const { id } = useParams<{ id: string }>();
  const idReparto = Number(id);
  const { recargar: recargarPerfil } = usePerfilRepartidor();
  const { datos: r, error, recargar, fijar } = useConsulta(
    () => datos(api.GET("/repartidor/repartos/{id}", { params: { path: { id: idReparto } } })),
    [idReparto],
  );
  const [hoja, setHoja] = useState<"entrega" | "incidencia">();
  const [aviso, setAviso] = useState<string>();

  const atras = (
    <Link href="/repartidor" aria-label="Volver a mis pedidos" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutro-fondo focus-visible:outline-2 focus-visible:outline-marca-rojo">
      <Icono nombre="atras" />
    </Link>
  );

  if (!r) {
    return (
      <>
        <CabeceraMovil titulo="Pedido" izquierda={atras} />
        <main className="p-4">
          {error ? <EstadoTabla error onReintentar={recargar}>{error.message}</EstadoTabla> : <p className="texto-pequeno text-neutro-texto-secundario">Cargando…</p>}
        </main>
      </>
    );
  }

  const p = r.pedido;
  const unidades = p.lineas.reduce((s, l) => s + l.cantidad, 0);
  const entregado = r.estado === "ENTREGADO";
  const pago = p.metodoPago === "EFECTIVO" ? "en efectivo" : "con tarjeta";

  return (
    <>
      <CabeceraMovil titulo={`Pedido ${codigoCorto(p.codigo)}`} subtitulo={`Asignado a las ${hora(r.fechaAsignacion)} · ${p.cliente.nombre}`} izquierda={atras} />
      <main className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <EtiquetaEstado estado={r.estado} />
          <p className="texto-destacado">Pago {pago} · {euros(p.total)}</p>
        </div>
        {aviso && <p role="status" className="rounded-xl bg-estado-exito-fondo px-4 py-2.5 texto-pequeno text-estado-exito-texto">{aviso}</p>}

        <MapaReparto latitud={p.latitud} longitud={p.longitud} direccion={p.direccionEntrega} />

        <section aria-labelledby="titulo-cliente" className={tarjeta}>
          <h2 id="titulo-cliente" className="texto-subtitulo">Cliente</h2>
          <p className="flex items-center gap-2.5 texto-destacado"><Icono nombre="perfil" />{p.cliente.nombre}</p>
          <p className="flex items-center gap-2.5 texto-normal"><Icono nombre="telefono" />{p.telefonoContacto}</p>
          <p className="flex items-center gap-2.5 texto-normal"><Icono nombre="ubicacion" />{p.direccionEntrega}</p>
          {p.nota && <p className="flex items-center gap-2.5 rounded-[10px] bg-estado-nota-fondo px-3 py-2 texto-pequeno"><Icono nombre="nota" />Nota: {p.nota}</p>}
        </section>

        <div className="flex gap-3">
          <a href={`tel:${p.telefonoContacto.replace(/\s/g, "")}`} className="flex flex-1 items-center justify-center rounded-[10px] border-[1.5px] border-neutro-borde bg-white px-[18px] py-2.5 texto-destacado focus-visible:outline-2 focus-visible:outline-marca-rojo">
            Llamar
          </a>
          <a href={enlaceRuta(r)} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center rounded-[10px] border-[1.5px] border-marca-rojo bg-white px-[18px] py-2.5 texto-destacado text-marca-rojo focus-visible:outline-2 focus-visible:outline-marca-rojo">
            Abrir ruta
          </a>
        </div>

        <section aria-labelledby="titulo-productos" className={tarjeta}>
          <h2 id="titulo-productos" className="texto-subtitulo">Pedido {codigoCorto(p.codigo)} · {unidades} {unidades === 1 ? "producto" : "productos"}</h2>
          {p.lineas.map((l, i) => (
            <div key={i} className="flex justify-between gap-4 texto-normal"><span>{l.cantidad}× {l.nombreProducto}</span><span>{euros(l.importe)}</span></div>
          ))}
          <div className="h-px bg-neutro-borde" />
          <div className="flex justify-between texto-pequeno"><span>Subtotal</span><span>{euros(p.subtotal)}</span></div>
          <div className="flex justify-between texto-pequeno"><span>Gastos de envío</span><span>{euros(p.gastosEnvio)}</span></div>
          <div className="flex justify-between texto-destacado"><span>{entregado ? "Total cobrado" : "Total a cobrar"}</span><span>{euros(p.total)}</span></div>
          <p className="flex items-center gap-2 texto-pequeno text-neutro-texto-secundario">
            <Icono nombre={p.metodoPago === "EFECTIVO" ? "efectivo" : "tarjeta"} />
            {entregado && r.fechaEntrega
              ? `Entregado a las ${hora(r.fechaEntrega)} · cobrado ${r.metodoCobro === "TARJETA" ? "con tarjeta" : "en efectivo"}`
              : `El cliente pagará ${pago}`}
          </p>
        </section>
      </main>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-neutro-borde bg-white px-4 pt-3 pb-6">
        {!entregado && <Boton tamano="grande" onClick={() => setHoja("entrega")}>Confirmar entrega</Boton>}
        <Boton tipo="fantasma" className="w-full" onClick={() => setHoja("incidencia")}>Comunicar incidencia</Boton>
      </div>

      <HojaConfirmarEntrega
        reparto={r}
        abierta={hoja === "entrega"}
        onCerrar={() => setHoja(undefined)}
        onEntregado={(nuevo) => {
          fijar(() => nuevo);
          recargarPerfil();
          setHoja(undefined);
          setAviso("Entrega confirmada. ¡Buen trabajo!");
        }}
      />
      <HojaIncidencia
        reparto={r}
        abierta={hoja === "incidencia"}
        onCerrar={() => setHoja(undefined)}
        onEnviada={() => {
          setHoja(undefined);
          setAviso("Incidencia enviada. El negocio la ha recibido.");
        }}
      />
    </>
  );
}
