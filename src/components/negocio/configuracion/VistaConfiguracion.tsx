"use client";

import { useState, type FormEvent } from "react";
import { Boton } from "@/components/ui/Boton";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { Interruptor } from "@/components/ui/Interruptor";
import { SelectorImagen } from "@/components/ui/SelectorImagen";
import { EstadoTabla } from "@/components/ui/Tarjeta";
import { api, datos, erroresPorCampo, formulario } from "@/lib/api/client";
import type { DatosMiNegocio, MiNegocio } from "@/lib/api/tipos";
import { importeEditable, iniciales, leerImporte } from "@/lib/formato";
import { CabeceraNegocio } from "../CabeceraNegocio";
import { useNegocio } from "../NegocioContexto";
import { DIAS, ModalHorario, textoFranjas } from "./ModalHorario";

const tarjeta = "flex flex-col rounded-2xl bg-white px-6 py-5 shadow-tarjeta";

type Errores = Partial<Record<keyof DatosMiNegocio | "logo", string>>;


/** N07 Configuración del negocio: datos, logo, horario y apertura (RF-18). */
export function VistaConfiguracion() {
  const { negocio, fijar, recargar } = useNegocio();
  const [editandoHorario, setEditandoHorario] = useState(false);

  return (
    <>
      <CabeceraNegocio titulo="Configuración del negocio" subtitulo="Los cambios se ven al momento en la app de clientes" />
      <main className="flex flex-1 flex-col gap-6 px-8 py-7 lg:flex-row lg:items-stretch">
        {!negocio ? (
          <EstadoTabla onReintentar={recargar}>Cargando los datos del negocio…</EstadoTabla>
        ) : (
          <>
            <FormularioDatos negocio={negocio} onGuardado={fijar} />
            <section aria-labelledby="titulo-horario" className={`${tarjeta} gap-3 lg:w-[420px] lg:shrink-0`}>
              <AbiertoAhora negocio={negocio} onCambio={fijar} />
              <h2 id="titulo-horario" className="texto-subtitulo">Horario de apertura</h2>
              <dl>
                {DIAS.map((dia, i) => {
                  const texto = textoFranjas(negocio.horarios.filter((f) => f.dia === i + 1));
                  return (
                    <div key={dia} className="flex justify-between gap-4 border-b border-neutro-borde py-1.5 texto-normal">
                      <dt className="font-semibold">{dia}</dt>
                      <dd className={texto ? "" : "text-neutro-texto-secundario"}>{texto || "Cerrado"}</dd>
                    </div>
                  );
                })}
              </dl>
              <Boton tipo="fantasma" className="self-start" onClick={() => setEditandoHorario(true)}>Editar horario</Boton>
            </section>
          </>
        )}
      </main>
      {negocio && (
        <ModalHorario
          abierto={editandoHorario}
          horarios={negocio.horarios}
          onCerrar={() => setEditandoHorario(false)}
          onGuardado={(n) => {
            fijar(n);
            setEditandoHorario(false);
          }}
        />
      )}
    </>
  );
}

function FormularioDatos({ negocio, onGuardado }: { negocio: MiNegocio; onGuardado: (n: MiNegocio) => void }) {
  const [logo, setLogo] = useState<File>();
  const [errores, setErrores] = useState<Errores>({});
  const [aviso, setAviso] = useState<{ error?: boolean; texto: string }>();
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const f = new FormData(evento.currentTarget);
    const texto = (campo: string) => String(f.get(campo) ?? "").trim();
    const datosNegocio: DatosMiNegocio = {
      nombre: texto("nombre"),
      descripcion: negocio.descripcion ?? null,
      telefono: texto("telefono"),
      direccion: texto("direccion"),
      gastosEnvio: leerImporte(texto("gastosEnvio")),
      pedidoMinimo: leerImporte(texto("pedidoMinimo")),
    };
    const nuevos: Errores = {};
    if (!datosNegocio.nombre) nuevos.nombre = "Escribe el nombre del negocio";
    if (datosNegocio.telefono.replace(/\D/g, "").length < 9) nuevos.telefono = "El teléfono debe tener al menos 9 cifras";
    if (!datosNegocio.direccion) nuevos.direccion = "Escribe la dirección";
    if (Number.isNaN(datosNegocio.gastosEnvio) || datosNegocio.gastosEnvio > 50) nuevos.gastosEnvio = "Entre 0 y 50 €, como 1,50";
    if (Number.isNaN(datosNegocio.pedidoMinimo) || datosNegocio.pedidoMinimo > 200) nuevos.pedidoMinimo = "Entre 0 y 200 €, como 10,00";
    setErrores(nuevos);
    setAviso(undefined);
    if (Object.keys(nuevos).length) return;

    setEnviando(true);
    try {
      // openapi-typescript tipa los ficheros (format: binary) como string; viajan como Blob.
      const guardado = await datos(api.PUT("/negocio", { body: { datos: datosNegocio, logo: logo as unknown as string }, bodySerializer: formulario }));
      setAviso({ texto: "Cambios guardados." });
      onGuardado(guardado);
    } catch (e) {
      const porCampo = erroresPorCampo(e);
      if (porCampo) setErrores(porCampo);
      else setAviso({ error: true, texto: (e as Error).message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate aria-labelledby="titulo-datos" className={`${tarjeta} min-w-0 flex-1 gap-[18px]`}>
      <h2 id="titulo-datos" className="texto-subtitulo">Datos del negocio</h2>
      <SelectorImagen
        actual={negocio.logoUrl}
        texto="Cambiar logo"
        onCambio={({ archivo }) => setLogo(archivo)}
        error={errores.logo}
        vista={(url) =>
          url ? (
            // eslint-disable-next-line @next/next/no-img-element -- logo de Supabase Storage (o blob: en el simulador)
            <img src={url} alt="Logo del negocio" width={72} height={72} className="size-[72px] shrink-0 rounded-full object-cover" />
          ) : (
            <span aria-hidden className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-marca-rojo-claro texto-titulo-l text-marca-rojo">
              {iniciales(negocio.nombre)}
            </span>
          )
        }
      />
      <div className="flex flex-col gap-4 sm:flex-row">
        <CampoTexto etiqueta="Nombre" name="nombre" defaultValue={negocio.nombre} maxLength={100} error={errores.nombre} />
        <CampoTexto etiqueta="Teléfono" name="telefono" type="tel" defaultValue={negocio.telefono} error={errores.telefono} autoComplete="tel" />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* La localidad la fija el administrador al dar de alta el negocio. */}
        <CampoTexto etiqueta="Localidad" name="localidad" value={`${negocio.localidad.nombre} (${negocio.localidad.provincia})`} readOnly disabled title="La localidad solo la cambia el administrador" />
        <CampoTexto etiqueta="Dirección" name="direccion" defaultValue={negocio.direccion} maxLength={200} error={errores.direccion} autoComplete="street-address" />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <CampoTexto etiqueta="Gastos de envío (€)" name="gastosEnvio" inputMode="decimal" defaultValue={importeEditable(negocio.gastosEnvio)} error={errores.gastosEnvio} />
        <CampoTexto etiqueta="Pedido mínimo (€)" name="pedidoMinimo" inputMode="decimal" defaultValue={importeEditable(negocio.pedidoMinimo)} error={errores.pedidoMinimo} />
      </div>
      <div className="flex-1" />
      <div className="flex items-center justify-end gap-4">
        {aviso && (
          <p role={aviso.error ? "alert" : "status"} className={`texto-pequeno ${aviso.error ? "text-estado-error" : "text-estado-exito-texto"}`}>{aviso.texto}</p>
        )}
        <Boton type="submit" disabled={enviando}>{enviando ? "Guardando…" : "Guardar cambios"}</Boton>
      </div>
    </form>
  );
}

/** Caja verde "Abierto ahora" de N07: el mismo interruptor que el de la cabecera. */
function AbiertoAhora({ negocio, onCambio }: { negocio: MiNegocio; onCambio: (n: MiNegocio) => void }) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string>();

  async function cambiar(abierto: boolean) {
    setGuardando(true);
    setError(undefined);
    try {
      onCambio(await datos(api.PATCH("/negocio/abierto", { body: { abierto } })));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  const titulo = negocio.abierto ? "Abierto ahora" : negocio.abiertoManual ? "Fuera de horario" : "Cerrado";
  const detalle = error
    ?? (negocio.abiertoManual
      ? negocio.abierto ? "Si lo cierras, la app deja de admitir pedidos." : "Abrirá solo cuando empiece su horario."
      : "La app no admite pedidos hasta que lo abras.");

  return (
    <div className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${negocio.abierto ? "bg-estado-exito-fondo" : "bg-neutro-fondo"}`}>
      <Interruptor activado={negocio.abiertoManual} onChange={cambiar} deshabilitado={guardando} etiqueta="Negocio abierto" />
      <div className="flex flex-col gap-0.5">
        <p className={`texto-destacado ${negocio.abierto ? "text-estado-exito-texto" : ""}`}>{titulo}</p>
        <p role={error ? "alert" : undefined} className={`texto-pequeno ${error ? "text-estado-error" : "text-neutro-texto-secundario"}`}>{detalle}</p>
      </div>
    </div>
  );
}
