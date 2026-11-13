"use client";

import Link from "next/link";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Icono } from "@/components/ui/Icono";
import { TarjetaKpi } from "@/components/ui/TarjetaKpi";
import { EstadoTabla, Tarjeta } from "@/components/ui/Tarjeta";
import { api, datos } from "@/lib/api/client";
import { TEXTO_TIPO_INCIDENCIA, fechaLarga, fechaRelativa, plural } from "@/lib/formato";
import { useConsulta } from "@/lib/useConsulta";
import { Cabecera, useFechaDeHoy } from "@/components/panel/Cabecera";

/** A01 Admin · Resumen (RF-31). */
export function VistaResumen() {
  const hoy = useFechaDeHoy();
  const { datos: resumen, error, cargando, recargar } = useConsulta(() => datos(api.GET("/admin/resumen")), []);

  return (
    <>
      <Cabecera titulo="Resumen de la plataforma" subtitulo={hoy && fechaLarga(hoy)} />
      <main className="flex flex-1 flex-col gap-6 px-8 py-7">
        {error && <EstadoTabla error onReintentar={recargar}>{error.message}</EstadoTabla>}

        <div className="grid grid-cols-2 gap-6 xl:grid-cols-4" aria-busy={cargando}>
          <TarjetaKpi
            etiqueta="Negocios activos"
            valor={resumen?.negociosActivos ?? "–"}
            detalle={resumen ? `de ${resumen.negociosTotales} dados de alta` : " "}
          />
          <TarjetaKpi
            etiqueta="Pedidos hoy"
            valor={resumen?.pedidosHoy ?? "–"}
            detalle={resumen ? `en ${plural(resumen.localidadesConPedidosHoy, "localidad", "localidades")}` : " "}
          />
          <TarjetaKpi
            etiqueta="Incidencias abiertas"
            valor={resumen?.incidenciasAbiertas ?? "–"}
            detalle={resumen ? `${resumen.incidenciasHoy} ${resumen.incidenciasHoy === 1 ? "comunicada" : "comunicadas"} hoy` : " "}
          />
          <TarjetaKpi etiqueta="Repartidores en ruta" valor={resumen?.repartidoresEnRuta ?? "–"} detalle="ahora mismo" />
        </div>

        <div className="flex flex-col items-start gap-6 xl:flex-row">
          <Tarjeta titulo="Pedidos de hoy por negocio" className="w-full min-w-0 flex-1">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-neutro-borde texto-etiqueta text-neutro-texto-secundario">
                    <th className="py-2 pr-4 font-medium">Negocio</th>
                    <th className="w-40 py-2 pr-4 font-medium">Localidad</th>
                    <th className="w-[100px] py-2 pr-4 font-medium">Pedidos</th>
                    <th className="w-[140px] py-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen?.pedidosHoyPorNegocio.map((fila) => (
                    <tr key={fila.negocioId} className="border-b border-neutro-borde texto-normal">
                      <td className="py-3 pr-4 font-semibold">{fila.nombre}</td>
                      <td className="py-3 pr-4">{fila.localidad}</td>
                      <td className="py-3 pr-4 tabular-nums">{fila.pedidos}</td>
                      <td className="py-3">
                        <Etiqueta texto={fila.abierto ? "Abierto" : "Cerrado"} tono={fila.abierto ? "exito" : "neutro"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {cargando && !resumen && <EstadoTabla>Cargando…</EstadoTabla>}
            {resumen?.pedidosHoyPorNegocio.length === 0 && <EstadoTabla>Aún no hay negocios activos.</EstadoTabla>}
          </Tarjeta>

          <Tarjeta className="w-full shrink-0 gap-3 xl:w-[380px]">
            <h2 className="texto-subtitulo">Incidencias recientes</h2>
            {resumen?.incidenciasRecientes.length === 0 && <p className="texto-normal text-neutro-texto-secundario">No hay incidencias abiertas.</p>}
            <ul className="flex flex-col gap-3">
              {resumen?.incidenciasRecientes.map((inc) => (
                <li key={inc.id} className="flex items-center gap-3 py-1.5">
                  <Icono nombre="incidencia" />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="texto-destacado">{TEXTO_TIPO_INCIDENCIA[inc.tipo]}</p>
                    <p className="truncate texto-pequeno text-neutro-texto-secundario">
                      {inc.negocio.nombre} · {fechaRelativa(inc.fechaCreacion).replace(/^Hoy, /, "")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/admin/incidencias"
              className="self-start rounded-[10px] border-[1.5px] border-neutro-borde bg-white px-[18px] py-2.5 texto-destacado hover:bg-neutro-fondo focus-visible:outline-2 focus-visible:outline-marca-rojo"
            >
              Ver todas
            </Link>
          </Tarjeta>
        </div>
      </main>
    </>
  );
}
