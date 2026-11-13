"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { EstadoTabla, Tarjeta } from "@/components/ui/Tarjeta";
import { api, datos } from "@/lib/api/client";
import type { EstadoIncidencia } from "@/lib/api/tipos";
import {
  TEXTO_ESTADO_INCIDENCIA, TEXTO_ORIGEN_INCIDENCIA, TEXTO_TIPO_INCIDENCIA, codigoCorto, fechaRelativa, plural,
} from "@/lib/formato";
import { useConsulta } from "@/lib/useConsulta";
import { Cabecera } from "./Cabecera";

const filtros: { clave: string; texto: string; titulo: string; estados?: EstadoIncidencia[] }[] = [
  { clave: "abiertas", texto: "Abiertas", titulo: "Incidencias abiertas", estados: ["ABIERTA", "RESPONDIDA"] },
  { clave: "resueltas", texto: "Resueltas", titulo: "Incidencias resueltas", estados: ["RESUELTA"] },
  { clave: "todas", texto: "Todas", titulo: "Todas las incidencias" },
];

const tonoEstado = { ABIERTA: "aviso", RESPONDIDA: "aviso", RESUELTA: "exito" } as const;

/** A04 Admin · Incidencias de todos los negocios (RF-30). Solo consulta: las gestiona cada negocio. */
export function VistaIncidencias() {
  const [filtro, setFiltro] = useState(filtros[0]);
  const [negocioId, setNegocioId] = useState<number>();

  const { datos: incidencias, error, cargando, recargar } = useConsulta(
    () => datos(api.GET("/admin/incidencias", { params: { query: { estado: filtro.estados, negocioId } } })),
    [filtro, negocioId],
  );
  const { datos: abiertas } = useConsulta(
    () => datos(api.GET("/admin/incidencias", { params: { query: { estado: ["ABIERTA", "RESPONDIDA"] } } })),
    [],
  );
  const { datos: negocios } = useConsulta(() => datos(api.GET("/admin/negocios")), []);

  return (
    <>
      <Cabecera
        titulo="Incidencias de todos los negocios"
        subtitulo={abiertas && plural(abiertas.length, "abierta")}
      />
      <main className="flex flex-1 flex-col gap-6 px-8 py-7">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar incidencias">
          {filtros.map((f) => (
            <Chip key={f.clave} texto={f.texto} seleccionado={filtro.clave === f.clave} onClick={() => setFiltro(f)} />
          ))}
          <label className="relative">
            <span className="sr-only">Negocio</span>
            <select
              value={negocioId ?? ""}
              onChange={(e) => setNegocioId(e.target.value ? Number(e.target.value) : undefined)}
              className="field-sizing-content cursor-pointer appearance-none rounded-[10px] border-[1.5px] border-neutro-borde bg-white py-2.5 pr-8 pl-[18px] texto-destacado hover:bg-neutro-fondo focus-visible:outline-2 focus-visible:outline-marca-rojo"
            >
              <option value="">Negocio: Todos</option>
              {negocios?.map((n) => (
                <option key={n.id} value={n.id}>Negocio: {n.nombre}</option>
              ))}
            </select>
            <span aria-hidden className="pointer-events-none absolute top-1/2 right-[18px] -translate-y-1/2 text-[10px]">▾</span>
          </label>
        </div>

        <Tarjeta titulo={filtro.titulo}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutro-borde texto-etiqueta text-neutro-texto-secundario">
                  <th className="py-2 pr-4 font-medium">Tipo</th>
                  <th className="w-[200px] py-2 pr-4 font-medium">Negocio</th>
                  <th className="w-[90px] py-2 pr-4 font-medium">Pedido</th>
                  <th className="w-[120px] py-2 pr-4 font-medium">Origen</th>
                  <th className="w-[130px] py-2 pr-4 font-medium">Fecha</th>
                  <th className="w-[110px] py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {incidencias?.map((inc) => (
                  <tr key={inc.id} className="border-b border-neutro-borde texto-normal" title={inc.descripcion}>
                    <td className="py-3 pr-4 font-semibold">{TEXTO_TIPO_INCIDENCIA[inc.tipo]}</td>
                    <td className="py-3 pr-4">{inc.negocio.nombre}</td>
                    <td className="py-3 pr-4 tabular-nums" title={inc.pedido.codigo}>{codigoCorto(inc.pedido.codigo)}</td>
                    <td className="py-3 pr-4">{TEXTO_ORIGEN_INCIDENCIA[inc.origen]}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{fechaRelativa(inc.fechaCreacion)}</td>
                    <td className="py-3">
                      <Etiqueta texto={TEXTO_ESTADO_INCIDENCIA[inc.estado]} tono={tonoEstado[inc.estado]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {cargando && !incidencias && <EstadoTabla>Cargando incidencias…</EstadoTabla>}
          {error && <EstadoTabla error onReintentar={recargar}>{error.message}</EstadoTabla>}
          {incidencias?.length === 0 && <EstadoTabla>No hay incidencias con este filtro.</EstadoTabla>}
        </Tarjeta>
      </main>
    </>
  );
}
