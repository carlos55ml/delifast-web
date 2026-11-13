"use client";

import { useState } from "react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis } from "recharts";
import { Chip } from "@/components/ui/Chip";
import { TarjetaKpi } from "@/components/ui/TarjetaKpi";
import { EstadoTabla } from "@/components/ui/Tarjeta";
import { api, datos } from "@/lib/api/client";
import type { EstadisticasNegocio, Periodo } from "@/lib/api/tipos";
import { euros } from "@/lib/formato";
import { useConsulta } from "@/lib/useConsulta";
import { CabeceraNegocio } from "../CabeceraNegocio";

/** `anterior`: el periodo con el que se compara, sin preposición ("ayer", "la semana pasada"…). */
const PERIODOS: { valor: Periodo; texto: string; anterior: string; grafica: string }[] = [
  { valor: "DIA", texto: "Día", anterior: "ayer", grafica: "Pedidos por hora" },
  { valor: "SEMANA", texto: "Semana", anterior: "la semana pasada", grafica: "Pedidos por día" },
  { valor: "MES", texto: "Mes", anterior: "el mes pasado", grafica: "Pedidos por día" },
];

/** "a ayer", "a la semana pasada", "al mes pasado" */
const frenteA = (anterior: string) => (anterior.startsWith("el ") ? `al ${anterior.slice(3)}` : `a ${anterior}`);
/** "de ayer", "de la semana pasada", "del mes pasado" */
const de = (anterior: string) => (anterior.startsWith("el ") ? `del ${anterior.slice(3)}` : `de ${anterior}`);

const tarjeta = "flex flex-col rounded-2xl bg-white px-6 py-5 shadow-tarjeta";
const ROJO_CLARO = "var(--color-marca-rojo-claro)";
const SECUNDARIO = "var(--color-neutro-texto-secundario)";

/** N06 Estadísticas del negocio por día, semana o mes (RF-22). La gráfica usa Recharts. */
export function VistaEstadisticas() {
  const [periodo, setPeriodo] = useState<Periodo>("SEMANA");
  const { datos: e, error, cargando, recargar } = useConsulta(
    () => datos(api.GET("/negocio/estadisticas", { params: { query: { periodo } } })),
    [periodo],
  );
  const config = PERIODOS.find((p) => p.valor === periodo)!;

  return (
    <>
      <CabeceraNegocio titulo="Estadísticas" subtitulo={e && textoPeriodo(e)} />
      <main className="flex flex-1 flex-col gap-6 px-8 py-7">
        <div role="group" aria-label="Periodo" className="flex gap-2">
          {PERIODOS.map((p) => (
            <Chip key={p.valor} texto={p.texto} seleccionado={periodo === p.valor} onClick={() => setPeriodo(p.valor)} />
          ))}
        </div>

        {error && !e ? (
          <EstadoTabla error onReintentar={recargar}>No se han podido cargar las estadísticas. {error.message}</EstadoTabla>
        ) : !e ? (
          <EstadoTabla>Cargando…</EstadoTabla>
        ) : (
          <div className={`flex flex-1 flex-col gap-6 transition-opacity ${cargando ? "opacity-60" : ""}`} aria-busy={cargando}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <TarjetaKpi etiqueta="Pedidos" valor={e.pedidos.toLocaleString("es-ES")} {...variacion(e.pedidos, e.pedidosAnterior, config.anterior)} />
              <TarjetaKpi
                etiqueta="Facturación"
                valor={euros(e.facturacion).replace(/,00\s€$/, " €")}
                {...variacion(e.facturacion, e.facturacionAnterior, config.anterior)}
              />
              <TarjetaKpi etiqueta="Tiempo medio de entrega" valor={e.tiempoMedioEntregaMin === null || e.tiempoMedioEntregaMin === undefined ? "—" : `${e.tiempoMedioEntregaMin} min`} {...variacionTiempo(e, config.anterior)} />
              <TarjetaKpi
                etiqueta="Incidencias"
                valor={e.incidencias.total}
                detalle={`${e.incidencias.resueltas} ${e.incidencias.resueltas === 1 ? "resuelta" : "resueltas"} · ${e.incidencias.abiertas} ${e.incidencias.abiertas === 1 ? "abierta" : "abiertas"}`}
                tono={e.incidencias.abiertas > 0 ? "neutro" : "exito"}
              />
            </div>

            <div className="flex flex-1 flex-col gap-6 lg:flex-row">
              <section aria-labelledby="titulo-grafica" className={`${tarjeta} min-h-[340px] min-w-0 flex-1 gap-4`}>
                <h2 id="titulo-grafica" className="texto-subtitulo">{config.grafica}</h2>
                <Grafica serie={e.serie} periodo={periodo} />
              </section>
              <section aria-labelledby="titulo-mas-vendidos" className={`${tarjeta} gap-3.5 lg:w-[380px] lg:shrink-0`}>
                <h2 id="titulo-mas-vendidos" className="texto-subtitulo">Productos más vendidos</h2>
                {e.masVendidos.length === 0 && <p className="texto-normal text-neutro-texto-secundario">Aún no hay ventas en este periodo.</p>}
                <ol className="flex flex-col gap-3.5">
                  {e.masVendidos.map((p) => (
                    <li key={p.nombre} className="flex flex-col gap-1.5">
                      <div className="flex justify-between gap-4 texto-normal">
                        <span>{p.nombre}</span>
                        <span className="font-semibold whitespace-nowrap">{p.unidades} uds.</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded bg-neutro-borde" aria-hidden>
                        <div className="degradado-marca h-2 rounded" style={{ width: `${(p.unidades / Math.max(1, e.masVendidos[0]!.unidades)) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

/** Barras como en N06: rojo claro y la mayor con el degradado de marca; el número encima. */
function Grafica({ serie, periodo }: { serie: EstadisticasNegocio["serie"]; periodo: Periodo }) {
  const maximo = Math.max(...serie.map((s) => s.pedidos));
  const total = serie.reduce((s, x) => s + x.pedidos, 0);
  return (
    <figure className="min-h-[260px] flex-1" aria-label={`Gráfica de barras: ${serie.map((s) => `${s.etiqueta} ${s.pedidos}`).join(", ")}`}>
      {total === 0 ? (
        <p className="texto-normal text-neutro-texto-secundario">No hay pedidos en este periodo.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%" minHeight={260}>
          <BarChart data={serie} margin={{ top: 24, right: 8, bottom: 0, left: 8 }} barCategoryGap={periodo === "MES" ? "15%" : "25%"}>
            <defs>
              <linearGradient id="degradado-barra" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-marca-rojo)" />
                <stop offset="100%" stopColor="var(--color-marca-naranja)" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="etiqueta"
              axisLine={false}
              tickLine={false}
              interval={periodo === "MES" ? 1 : 0}
              tick={{ fill: SECUNDARIO, fontSize: 13 }}
            />
            <Bar dataKey="pedidos" radius={[8, 8, 0, 0]} maxBarSize={44} isAnimationActive={false}>
              {periodo !== "MES" && <LabelList dataKey="pedidos" position="top" fill={SECUNDARIO} fontSize={12} fontWeight={500} />}
              {serie.map((s) => (
                <Cell key={s.etiqueta} fill={s.pedidos === maximo ? "url(#degradado-barra)" : ROJO_CLARO} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </figure>
  );
}

function variacion(actual: number, anterior: number, frente: string): { detalle: string; tono: "exito" | "error" | "neutro" } {
  if (!anterior) return { detalle: `Sin datos ${de(frente)}`, tono: "neutro" };
  const pct = Math.round(((actual - anterior) / anterior) * 100);
  return { detalle: `${pct > 0 ? "+" : ""}${pct} % frente ${frenteA(frente)}`, tono: pct >= 0 ? "exito" : "error" };
}

function variacionTiempo(e: EstadisticasNegocio, frente: string): { detalle: string; tono: "exito" | "error" | "neutro" } {
  const a = e.tiempoMedioEntregaMin;
  const b = e.tiempoMedioEntregaAnteriorMin;
  if (a == null) return { detalle: "Sin entregas en este periodo", tono: "neutro" };
  if (b == null) return { detalle: `Sin datos ${de(frente)}`, tono: "neutro" };
  if (a === b) return { detalle: `Igual que ${frente}`, tono: "neutro" };
  // "que ayer", "que la semana pasada", "que el mes pasado"
  const d = Math.abs(a - b);
  return { detalle: `${d} min ${a < b ? "menos" : "más"} que ${frente}`, tono: a < b ? "exito" : "error" };
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** "Semana del 3 al 9 de noviembre de 2026", "Jueves 13 de noviembre de 2026", "Noviembre de 2026" */
function textoPeriodo(e: EstadisticasNegocio): string {
  const [ad, am, aa] = partes(e.desde);
  const [hd, hm, ha] = partes(e.hasta);
  if (e.periodo === "MES") return `${MESES[am]!.charAt(0).toUpperCase()}${MESES[am]!.slice(1)} de ${aa}`;
  if (e.periodo === "DIA") {
    const dia = new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(new Date(aa, am, ad));
    return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${ad} de ${MESES[am]} de ${aa}`;
  }
  if (am === hm) return `Semana del ${ad} al ${hd} de ${MESES[hm]} de ${ha}`;
  return `Semana del ${ad} de ${MESES[am]}${aa !== ha ? ` de ${aa}` : ""} al ${hd} de ${MESES[hm]} de ${ha}`;
}

/** "2026-11-03" → [3, 10, 2026] (mes desde 0) */
function partes(fecha: string): [number, number, number] {
  const [a, m, d] = fecha.split("-").map(Number);
  return [d!, m! - 1, a!];
}
