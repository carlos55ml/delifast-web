"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Chip } from "@/components/ui/Chip";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Icono } from "@/components/ui/Icono";
import { EstadoTabla } from "@/components/ui/Tarjeta";
import { api, datos } from "@/lib/api/client";
import type { EstadoIncidencia, IncidenciaNegocio } from "@/lib/api/tipos";
import { TEXTO_ESTADO_INCIDENCIA, TEXTO_TIPO_INCIDENCIA, codigoCorto, euros, fechaRelativa, hora } from "@/lib/formato";
import { useConsulta } from "@/lib/useConsulta";
import { CabeceraNegocio } from "../CabeceraNegocio";

const FILTROS: { texto: string; estados: EstadoIncidencia[] }[] = [
  { texto: "Abiertas", estados: ["ABIERTA", "RESPONDIDA"] },
  { texto: "Resueltas", estados: ["RESUELTA"] },
  { texto: "Todas", estados: [] },
];
const tonoEstado = { ABIERTA: "aviso", RESPONDIDA: "aviso", RESUELTA: "exito" } as const;
const tarjeta = "flex flex-col rounded-2xl bg-white px-6 py-5 shadow-tarjeta";
const esHoy = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

/** N05 Incidencias: lista filtrable y detalle para responder y resolver (RF-21). */
export function VistaIncidenciasNegocio() {
  const [filtro, setFiltro] = useState(0);
  // Se piden todas una vez y se filtran aquí: así el subtítulo cuenta abiertas y resueltas.
  const { datos: incidencias, error, recargar, fijar } = useConsulta(() => datos(api.GET("/negocio/incidencias")), []);
  const [elegidaId, setElegidaId] = useState<number>();

  const { estados } = FILTROS[filtro]!;
  const visibles = incidencias?.filter((i) => estados.length === 0 || estados.includes(i.estado));
  const elegida = visibles?.find((i) => i.id === elegidaId) ?? visibles?.[0];
  const abiertas = incidencias?.filter((i) => i.estado !== "RESUELTA").length ?? 0;
  const resueltasHoy = incidencias?.filter((i) => i.estado === "RESUELTA" && i.fechaResolucion && esHoy(i.fechaResolucion)).length ?? 0;
  const subtitulo = incidencias && `${abiertas} ${abiertas === 1 ? "abierta" : "abiertas"} · ${resueltasHoy} ${resueltasHoy === 1 ? "resuelta" : "resueltas"} hoy`;

  const actualizar = (inc: IncidenciaNegocio) => fijar((l = []) => l.map((x) => (x.id === inc.id ? inc : x)));

  return (
    <>
      <CabeceraNegocio titulo="Incidencias" subtitulo={subtitulo} />
      <main className="flex flex-1 flex-col gap-6 px-8 py-7 lg:flex-row lg:items-stretch">
        {error && !incidencias ? (
          <EstadoTabla error onReintentar={recargar}>No se han podido cargar las incidencias. {error.message}</EstadoTabla>
        ) : (
          <>
            <section aria-label="Lista de incidencias" className={`${tarjeta} gap-3 lg:w-[400px] lg:shrink-0`}>
              <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2 pb-1">
                {FILTROS.map((f, i) => (
                  <Chip key={f.texto} texto={f.texto} seleccionado={filtro === i} onClick={() => setFiltro(i)} />
                ))}
              </div>
              {!incidencias && <p className="texto-pequeno text-neutro-texto-secundario">Cargando…</p>}
              {visibles?.length === 0 && <p className="py-4 texto-normal text-neutro-texto-secundario">No hay incidencias {filtro === 0 ? "abiertas" : filtro === 1 ? "resueltas" : ""}.</p>}
              <ul className="flex flex-col gap-3">
                {visibles?.map((inc) => {
                  const activa = inc.id === elegida?.id;
                  return (
                    <li key={inc.id}>
                      <button
                        type="button"
                        onClick={() => setElegidaId(inc.id)}
                        aria-current={activa ? "true" : undefined}
                        className={`flex w-full cursor-pointer flex-col gap-1.5 rounded-xl px-3.5 py-3 text-left focus-visible:outline-2 focus-visible:outline-marca-rojo ${
                          activa ? "bg-marca-rojo-claro" : "border border-neutro-borde hover:bg-neutro-fondo"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="texto-destacado">{TEXTO_TIPO_INCIDENCIA[inc.tipo]}</span>
                          <Etiqueta texto={TEXTO_ESTADO_INCIDENCIA[inc.estado]} tono={tonoEstado[inc.estado]} />
                        </span>
                        <span className="texto-pequeno text-neutro-texto-secundario">
                          Pedido {codigoCorto(inc.pedido.codigo)} · {inc.origen === "REPARTIDOR" ? "Repartidor" : "Cliente"} {inc.autor.nombre} · {esHoy(inc.fechaCreacion) ? hora(inc.fechaCreacion) : fechaRelativa(inc.fechaCreacion)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section aria-label="Detalle de la incidencia" className={`${tarjeta} min-w-0 flex-1 gap-4`}>
              {elegida ? <Detalle key={elegida.id} incidencia={elegida} onActualizada={actualizar} /> : (
                <p className="texto-normal text-neutro-texto-secundario">{incidencias ? "Elige una incidencia para ver el detalle." : "Cargando…"}</p>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

function Detalle({ incidencia: inc, onActualizada }: { incidencia: IncidenciaNegocio; onActualizada: (i: IncidenciaNegocio) => void }) {
  const [respuesta, setRespuesta] = useState(inc.respuesta ?? "");
  const [enviando, setEnviando] = useState<"responder" | "resolver">();
  const [aviso, setAviso] = useState<{ error?: boolean; texto: string }>();
  const resuelta = inc.estado === "RESUELTA";
  const ruta = { params: { path: { id: inc.id } } };
  const texto = respuesta.trim();

  async function enviar(accion: "responder" | "resolver") {
    setEnviando(accion);
    setAviso(undefined);
    try {
      const nueva = accion === "responder"
        ? await datos(api.POST("/incidencias/{id}/responder", { ...ruta, body: { respuesta: texto } }))
        : await datos(api.POST("/incidencias/{id}/resolver", { ...ruta, body: texto && texto !== inc.respuesta ? { respuesta: texto } : {} }));
      onActualizada(nueva);
      setAviso({ texto: accion === "responder" ? "Respuesta enviada. El cliente la verá en la app." : "Incidencia resuelta." });
    } catch (e) {
      setAviso({ error: true, texto: (e as Error).message });
    } finally {
      setEnviando(undefined);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="texto-titulo-l">{TEXTO_TIPO_INCIDENCIA[inc.tipo]}</h2>
        <Etiqueta texto={TEXTO_ESTADO_INCIDENCIA[inc.estado]} tono={tonoEstado[inc.estado]} />
      </div>
      <p className="flex items-center gap-2.5 texto-normal">
        <Icono nombre="pedidos" />
        Pedido {codigoCorto(inc.pedido.codigo)} · {euros(inc.pedido.total)} · pago {inc.pedido.metodoPago === "EFECTIVO" ? "en efectivo" : "con tarjeta"}
      </p>
      <p className="flex items-center gap-2.5 texto-normal">
        <Icono nombre="moto" />
        Comunicada por {inc.autor.nombre} ({inc.origen === "REPARTIDOR" ? "repartidor" : "cliente"}) {esHoy(inc.fechaCreacion) ? `a las ${hora(inc.fechaCreacion)}` : `el ${fechaRelativa(inc.fechaCreacion)}`}
      </p>
      <p className="flex items-center gap-2.5 texto-normal">
        <Icono nombre="telefono" />
        <span>
          Cliente: {inc.pedido.cliente.nombre} ·{" "}
          <a href={`tel:${inc.pedido.cliente.telefono.replace(/\s/g, "")}`} className="hover:underline">{inc.pedido.cliente.telefono}</a>
        </span>
      </p>
      <div className="flex flex-col gap-1 rounded-xl bg-neutro-fondo px-4 py-3">
        <p className="texto-etiqueta text-neutro-texto-secundario">Descripción</p>
        <p className="texto-normal">{inc.descripcion}</p>
      </div>

      {resuelta ? (
        <div className="flex flex-col gap-1 rounded-xl bg-estado-exito-fondo px-4 py-3">
          <p className="texto-etiqueta text-estado-exito-texto">
            Resuelta{inc.fechaResolucion ? ` ${esHoy(inc.fechaResolucion) ? `a las ${hora(inc.fechaResolucion)}` : fechaRelativa(inc.fechaResolucion)}` : ""}
          </p>
          <p className="texto-normal">{inc.respuesta ?? "Sin respuesta escrita."}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="respuesta-incidencia" className="texto-etiqueta text-neutro-texto-secundario">Respuesta</label>
          <textarea
            id="respuesta-incidencia"
            rows={3}
            maxLength={500}
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder="Escribe la respuesta que verá el cliente"
            className="w-full resize-none rounded-xl border border-neutro-borde px-4 py-3 texto-normal outline-none placeholder:text-neutro-texto-secundario focus:border-2 focus:border-marca-rojo focus:px-[15px] focus:py-[11px]"
          />
          {inc.estado === "RESPONDIDA" && <p className="texto-pequeno text-neutro-texto-secundario">Ya respondida. Si la cambias, el cliente verá la nueva.</p>}
        </div>
      )}

      <div className="flex-1" />
      {aviso && <p role={aviso.error ? "alert" : "status"} className={`texto-pequeno ${aviso.error ? "text-estado-error" : "text-estado-exito-texto"}`}>{aviso.texto}</p>}
      {!resuelta && (
        <div className="flex flex-wrap justify-end gap-3">
          <Boton tipo="secundario" disabled={!texto || !!enviando || texto === inc.respuesta} onClick={() => enviar("responder")}>
            {enviando === "responder" ? "Enviando…" : "Enviar respuesta"}
          </Boton>
          <Boton disabled={!!enviando} onClick={() => enviar("resolver")}>{enviando === "resolver" ? "Guardando…" : "Marcar como resuelta"}</Boton>
        </div>
      )}
    </>
  );
}
