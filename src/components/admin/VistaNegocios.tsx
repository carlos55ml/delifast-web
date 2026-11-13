"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Chip } from "@/components/ui/Chip";
import { Icono } from "@/components/ui/Icono";
import { Interruptor } from "@/components/ui/Interruptor";
import { EstadoTabla, Tarjeta } from "@/components/ui/Tarjeta";
import { api, datos } from "@/lib/api/client";
import type { NegocioAdmin } from "@/lib/api/tipos";
import { plural } from "@/lib/formato";
import { useConsulta } from "@/lib/useConsulta";
import { Cabecera } from "./Cabecera";
import { FormularioNegocio } from "./FormularioNegocio";

const filtros = [
  { texto: "Todos", activo: undefined },
  { texto: "Activos", activo: true },
  { texto: "Suspendidos", activo: false },
] as const;

/** A02 Admin · Negocios (RF-29) con el alta A03 (RF-28). */
export function VistaNegocios() {
  const [filtro, setFiltro] = useState<boolean | undefined>(undefined);
  const [formulario, setFormulario] = useState<{ abierto: boolean; negocio?: NegocioAdmin }>({ abierto: false });
  const [cambiando, setCambiando] = useState<number>();
  const [aviso, setAviso] = useState<{ texto: string; error?: boolean }>();
  // Se piden todos para poder contar en la cabecera; el filtro es inmediato en el navegador.
  const { datos: negocios, error, cargando, recargar, fijar } = useConsulta(() => datos(api.GET("/admin/negocios")), []);

  const visibles = negocios?.filter((n) => filtro === undefined || n.activo === filtro) ?? [];
  const numLocalidades = new Set(negocios?.map((n) => n.localidad.id)).size;
  const reemplazar = (actualizado: NegocioAdmin) => fijar((lista = []) => lista.map((n) => (n.id === actualizado.id ? actualizado : n)));

  async function cambiarActivo(negocio: NegocioAdmin, activo: boolean) {
    if (!activo && !window.confirm(`¿Suspender ${negocio.nombre}? Dejará de aparecer en la app y sus cuentas no podrán entrar.`)) return;
    setCambiando(negocio.id);
    setAviso(undefined);
    reemplazar({ ...negocio, activo }); // optimista
    try {
      reemplazar(await datos(api.PATCH("/admin/negocios/{id}/activo", { params: { path: { id: negocio.id } }, body: { activo } })));
      setAviso({ texto: `${negocio.nombre} ${activo ? "vuelve a estar activo" : "queda suspendido"}.` });
    } catch (e) {
      reemplazar(negocio);
      setAviso({ texto: e instanceof Error ? e.message : "No se ha podido cambiar el estado", error: true });
    } finally {
      setCambiando(undefined);
    }
  }

  function alGuardar(negocio: NegocioAdmin, esNuevo: boolean) {
    if (esNuevo) fijar((lista = []) => [...lista, negocio].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")));
    else reemplazar(negocio);
    setFormulario({ abierto: false });
    setAviso({ texto: esNuevo ? `${negocio.nombre} dado de alta. Hemos enviado la invitación a ${negocio.dueno?.email}.` : `Datos de ${negocio.nombre} guardados.` });
  }

  return (
    <>
      <Cabecera
        titulo="Negocios"
        subtitulo={negocios && `${plural(negocios.length, "negocio")} en ${plural(numLocalidades, "localidad", "localidades")}`}
      />
      <main className="flex flex-1 flex-col gap-6 px-8 py-7">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar negocios">
          {filtros.map((f) => (
            <Chip key={f.texto} texto={f.texto} seleccionado={filtro === f.activo} onClick={() => setFiltro(f.activo)} />
          ))}
        </div>

        {aviso && (
          <p role={aviso.error ? "alert" : "status"} className={`rounded-xl px-4 py-3 texto-pequeno ${aviso.error ? "bg-marca-rojo-claro text-estado-error" : "bg-estado-exito-fondo text-estado-exito-texto"}`}>
            {aviso.texto}
          </p>
        )}

        <Tarjeta
          titulo="Negocios dados de alta"
          subtitulo="Un negocio suspendido deja de aparecer en la app"
          accion={<Boton onClick={() => setFormulario({ abierto: true })}>+ Dar de alta negocio</Boton>}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutro-borde texto-etiqueta text-neutro-texto-secundario">
                  <th className="py-2 pr-4 font-medium">Negocio</th>
                  <th className="w-[150px] py-2 pr-4 font-medium">Localidad</th>
                  <th className="w-[190px] py-2 pr-4 font-medium">Dueño</th>
                  <th className="w-[110px] py-2 pr-4 font-medium">Pedidos hoy</th>
                  <th className="w-[150px] py-2 pr-4 font-medium">Estado</th>
                  <th className="w-10 py-2"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((n) => (
                  <tr key={n.id} className="border-b border-neutro-borde texto-normal">
                    <td className="py-3 pr-4 font-semibold">{n.nombre}</td>
                    <td className="py-3 pr-4">{n.localidad.nombre}</td>
                    <td className="py-3 pr-4" title={n.dueno?.email}>{n.dueno?.nombre ?? "Sin cuenta"}</td>
                    <td className="py-3 pr-4 tabular-nums">{n.pedidosHoy}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Interruptor
                          activado={n.activo}
                          etiqueta={`${n.nombre}: ${n.activo ? "activo" : "suspendido"}`}
                          deshabilitado={cambiando === n.id}
                          onChange={(valor) => cambiarActivo(n, valor)}
                        />
                        <span className={`texto-pequeno ${n.activo ? "text-neutro-texto-secundario" : "text-estado-error"}`}>
                          {n.activo ? "Activo" : "Suspendido"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setFormulario({ abierto: true, negocio: n })}
                        aria-label={`Editar ${n.nombre}`}
                        className="cursor-pointer rounded-md p-0.5 hover:bg-neutro-fondo focus-visible:outline-2 focus-visible:outline-marca-rojo"
                      >
                        <Icono nombre="editar" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {cargando && !negocios && <EstadoTabla>Cargando negocios…</EstadoTabla>}
          {error && <EstadoTabla error onReintentar={recargar}>{error.message}</EstadoTabla>}
          {negocios && visibles.length === 0 && (
            <EstadoTabla>{filtro === false ? "No hay negocios suspendidos." : "Aún no hay negocios. Da de alta el primero."}</EstadoTabla>
          )}
        </Tarjeta>
      </main>

      <FormularioNegocio
        abierto={formulario.abierto}
        negocio={formulario.negocio}
        onCerrar={() => setFormulario({ abierto: false })}
        onGuardado={alGuardar}
      />
    </>
  );
}
