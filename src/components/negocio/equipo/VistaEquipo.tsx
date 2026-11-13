"use client";

import { useState, type ReactNode } from "react";
import { useUsuario } from "@/components/panel/UsuarioContexto";
import { Boton } from "@/components/ui/Boton";
import { Icono } from "@/components/ui/Icono";
import { Interruptor } from "@/components/ui/Interruptor";
import { EstadoTabla, Tarjeta } from "@/components/ui/Tarjeta";
import { api, datos } from "@/lib/api/client";
import type { EmpleadoNegocio, RepartidorNegocio } from "@/lib/api/tipos";
import { useConsulta } from "@/lib/useConsulta";
import { CabeceraNegocio } from "../CabeceraNegocio";
import { FormularioMiembro, type TipoMiembro } from "./FormularioMiembro";

const celda = "py-3 pr-4";
const cabecera = "py-2 pr-4 text-left texto-etiqueta font-medium text-neutro-texto-secundario";

/**
 * N04 Equipo (RF-19): empleados y repartidores. Todo el negocio los edita y activa o
 * desactiva; solo el dueño crea cuentas (lo vuelve a comprobar la API).
 */
export function VistaEquipo() {
  const usuario = useUsuario();
  const esDueno = !!usuario?.esDueno;
  const empleados = useConsulta(() => datos(api.GET("/negocio/empleados")), []);
  const repartidores = useConsulta(() => datos(api.GET("/negocio/repartidores")), []);
  const [formulario, setFormulario] = useState<{ tipo: TipoMiembro; miembro?: EmpleadoNegocio | RepartidorNegocio }>();
  const [errorActivo, setErrorActivo] = useState<string>();

  async function cambiarActivo(tipo: TipoMiembro, id: string, activo: boolean) {
    setErrorActivo(undefined);
    const ruta = { params: { path: { id } }, body: { activo } };
    try {
      if (tipo === "empleado") {
        const e = await datos(api.PATCH("/negocio/empleados/{id}/activo", ruta));
        empleados.fijar((l = []) => l.map((x) => (x.id === e.id ? e : x)));
      } else {
        const r = await datos(api.PATCH("/negocio/repartidores/{id}/activo", ruta));
        repartidores.fijar((l = []) => l.map((x) => (x.id === r.id ? r : x)));
      }
    } catch (e) {
      setErrorActivo((e as Error).message);
    }
  }

  const botonAlta = (tipo: TipoMiembro, texto: string) => (
    <Boton
      onClick={() => setFormulario({ tipo })}
      disabled={!esDueno}
      title={esDueno ? undefined : "Solo el dueño del negocio puede crear cuentas"}
    >
      {texto}
    </Boton>
  );

  return (
    <>
      <CabeceraNegocio titulo="Equipo" subtitulo="Solo el dueño puede crear cuentas de empleados y repartidores" />
      <main className="flex flex-col gap-6 px-8 py-7">
        {errorActivo && <p role="alert" className="rounded-[10px] bg-marca-rojo-claro px-4 py-2.5 texto-pequeno text-estado-error">{errorActivo}</p>}

        <Tarjeta titulo="Empleados" subtitulo="Tienen acceso a todo el panel" accion={botonAlta("empleado", "+ Añadir empleado")}>
          <Tabla columnas={["Nombre", "Email", "Rol", "Estado"]} anchos={["", "w-[280px]", "w-[140px]", "w-[140px]"]} consulta={empleados}>
            {empleados.datos?.map((e) => (
              <tr key={e.id} className="border-b border-neutro-borde">
                <td className={`${celda} texto-destacado`}>{e.nombre}</td>
                <td className={`${celda} texto-normal break-all`}>{e.email}</td>
                <td className={`${celda} texto-normal`}>{e.esDueno ? "Dueño" : "Empleado"}</td>
                <td className={celda}>
                  {e.esDueno ? (
                    <span className="inline-flex w-[140px] rounded-full bg-neutro-gris px-2.5 py-1 texto-etiqueta text-neutro-texto-secundario">Siempre activo</span>
                  ) : (
                    <EstadoActivo activo={e.activo} nombre={e.nombre} onCambio={(v) => cambiarActivo("empleado", e.id, v)} />
                  )}
                </td>
                <td className="py-3 text-right">
                  {/* Como en N04, la fila del dueño no se edita desde aquí. */}
                  {!e.esDueno && <BotonEditar nombre={e.nombre} onClick={() => setFormulario({ tipo: "empleado", miembro: e })} />}
                </td>
              </tr>
            ))}
          </Tabla>
        </Tarjeta>

        <Tarjeta titulo="Repartidores" subtitulo="Una cuenta desactivada no puede iniciar sesión" accion={botonAlta("repartidor", "+ Añadir repartidor")}>
          <Tabla columnas={["Nombre", "Teléfono", "Repartos hoy", "Estado"]} anchos={["", "w-[180px]", "w-[140px]", "w-[140px]"]} consulta={repartidores}>
            {repartidores.datos?.map((r) => (
              <tr key={r.id} className="border-b border-neutro-borde">
                <td className={celda}>
                  <span className="texto-destacado">{r.nombre}</span>
                  {r.activo && !r.disponible && <span className="block texto-pequeno text-neutro-texto-secundario">No disponible ahora</span>}
                </td>
                <td className={`${celda} texto-normal`}>{r.telefono ?? "—"}</td>
                <td className={`${celda} texto-normal`}>{r.repartosHoy}</td>
                <td className={celda}>
                  <EstadoActivo activo={r.activo} nombre={r.nombre} onCambio={(v) => cambiarActivo("repartidor", r.id, v)} />
                </td>
                <td className="py-3 text-right">
                  <BotonEditar nombre={r.nombre} onClick={() => setFormulario({ tipo: "repartidor", miembro: r })} />
                </td>
              </tr>
            ))}
          </Tabla>
        </Tarjeta>
      </main>

      <FormularioMiembro
        abierto={!!formulario}
        tipo={formulario?.tipo ?? "empleado"}
        miembro={formulario?.miembro}
        onCerrar={() => setFormulario(undefined)}
        onGuardado={(tipo, m) => {
          if (tipo === "empleado") empleados.fijar((l = []) => poner(l, m as EmpleadoNegocio));
          else repartidores.fijar((l = []) => poner(l, m as RepartidorNegocio).sort((a, b) => a.nombre.localeCompare(b.nombre, "es")));
          setFormulario(undefined);
        }}
      />
    </>
  );
}

/** Sustituye el elemento con el mismo id o lo añade al final. */
function poner<T extends { id: string }>(lista: T[], elemento: T): T[] {
  return lista.some((x) => x.id === elemento.id) ? lista.map((x) => (x.id === elemento.id ? elemento : x)) : [...lista, elemento];
}

function Tabla({ columnas, anchos, consulta, children }: {
  columnas: string[];
  anchos: string[];
  consulta: { datos?: unknown[]; error?: Error; recargar: () => void };
  children: ReactNode;
}) {
  if (consulta.error && !consulta.datos) return <EstadoTabla error onReintentar={consulta.recargar}>No se ha podido cargar. {consulta.error.message}</EstadoTabla>;
  if (!consulta.datos) return <EstadoTabla>Cargando…</EstadoTabla>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-neutro-borde">
            {columnas.map((c, i) => <th key={c} scope="col" className={`${cabecera} ${anchos[i]}`}>{c}</th>)}
            <th scope="col" className="w-[60px] py-2"><span className="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function EstadoActivo({ activo, nombre, onCambio }: { activo: boolean; nombre: string; onCambio: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Interruptor activado={activo} onChange={onCambio} etiqueta={activo ? `Desactivar a ${nombre}` : `Activar a ${nombre}`} />
      <span className={`texto-pequeno ${activo ? "text-neutro-texto-secundario" : "text-estado-error"}`}>{activo ? "Activo" : "Desactivado"}</span>
    </div>
  );
}

function BotonEditar({ nombre, onClick }: { nombre: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={`Editar a ${nombre}`} className="cursor-pointer rounded-md p-0.5 hover:bg-neutro-fondo focus-visible:outline-2 focus-visible:outline-marca-rojo">
      <Icono nombre="editar" />
    </button>
  );
}
