"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Icono, type NombreIcono } from "@/components/ui/Icono";
import { Interruptor } from "@/components/ui/Interruptor";
import { api, datos } from "@/lib/api/client";
import { cerrarSesion } from "@/lib/auth/sesion";
import { iniciales, plural } from "@/lib/formato";
import { BarraInferior } from "./BarraInferior";
import { CabeceraMovil } from "./CabeceraMovil";
import { usePerfilRepartidor } from "./PerfilContexto";

const tarjeta = "flex flex-col gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-tarjeta";

/** R06 Perfil: disponibilidad para repartos, datos y cerrar sesión. */
export function VistaPerfilRepartidor() {
  const { perfil, fijar } = usePerfilRepartidor();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string>();

  async function cambiarDisponible(disponible: boolean) {
    setGuardando(true);
    setError(undefined);
    try {
      fijar(await datos(api.PATCH("/repartidor/disponible", { body: { disponible } })));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <CabeceraMovil titulo="Perfil" subtitulo={perfil && `Repartidor de ${perfil.negocio.nombre}`} />
      <main className="flex flex-1 flex-col gap-4 p-4">
        {!perfil ? (
          <p className="texto-pequeno text-neutro-texto-secundario">Cargando…</p>
        ) : (
          <>
            <div className="flex items-center gap-3.5">
              <span aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-full bg-marca-rojo-claro texto-titulo-l text-marca-rojo">
                {iniciales(perfil.nombre)}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="truncate texto-titulo-l">{perfil.nombre}</p>
                <p className="texto-pequeno text-neutro-texto-secundario">{plural(perfil.repartosHoy, "reparto")} hoy · {perfil.enCurso} en curso</p>
              </div>
            </div>

            <section className={tarjeta}>
              <div className="flex items-center justify-between gap-3">
                <p id="etiqueta-disponible" className="texto-destacado">Disponible para repartos</p>
                <Interruptor activado={perfil.disponible} onChange={cambiarDisponible} deshabilitado={guardando} etiqueta="Disponible para repartos" />
              </div>
              <p role={error ? "alert" : undefined} className={`texto-pequeno ${error ? "text-estado-error" : "text-neutro-texto-secundario"}`}>
                {error ?? (perfil.disponible ? "Si lo desactivas, el negocio no podrá asignarte pedidos nuevos." : "El negocio no puede asignarte pedidos hasta que lo actives.")}
              </p>
            </section>

            <section aria-labelledby="titulo-mis-datos" className={tarjeta}>
              <h2 id="titulo-mis-datos" className="texto-subtitulo">Mis datos</h2>
              <Dato icono="perfil" etiqueta="Nombre" valor={perfil.nombre} />
              <Dato icono="telefono" etiqueta="Teléfono" valor={perfil.telefono ?? "—"} />
              <Dato icono="pedidos" etiqueta="Email" valor={perfil.email} />
              <Dato icono="negocio" etiqueta="Negocio" valor={`${perfil.negocio.nombre} · ${perfil.negocio.localidad}`} />
            </section>
            <p className="texto-pequeno text-neutro-texto-secundario">Para cambiar tus datos, habla con el dueño del negocio.</p>
            <div className="flex-1" />
            <Boton tipo="fantasma" className="w-full" onClick={cerrarSesion}>Cerrar sesión</Boton>
          </>
        )}
      </main>
      <BarraInferior />
    </>
  );
}

function Dato({ icono, etiqueta, valor }: { icono: NombreIcono; etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icono nombre={icono} />
      <div className="flex min-w-0 flex-col">
        <span className="texto-etiqueta text-neutro-texto-secundario">{etiqueta}</span>
        <span className="texto-normal break-all">{valor}</span>
      </div>
    </div>
  );
}
