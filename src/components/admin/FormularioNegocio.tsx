"use client";

import { useState, type FormEvent } from "react";
import { Boton } from "@/components/ui/Boton";
import { CampoSelect, CampoTexto } from "@/components/ui/CampoTexto";
import { Icono } from "@/components/ui/Icono";
import { Modal } from "@/components/ui/Modal";
import { ErrorApi, api, datos } from "@/lib/api/client";
import type { DatosNegocio, NegocioAdmin } from "@/lib/api/tipos";
import { useConsulta } from "@/lib/useConsulta";

type Errores = Partial<Record<"nombre" | "localidadId" | "direccion" | "telefono" | "dueno.nombre" | "dueno.email", string>>;

/**
 * A03 Admin · Alta de negocio (RF-28). Con `negocio` sirve también para editar sus datos
 * básicos (icono de lápiz de A02); en ese caso no se pide la cuenta del dueño.
 */
export function FormularioNegocio({ abierto, negocio, onCerrar, onGuardado }: {
  abierto: boolean;
  negocio?: NegocioAdmin;
  onCerrar: () => void;
  onGuardado: (negocio: NegocioAdmin, esNuevo: boolean) => void;
}) {
  const esAlta = !negocio;
  const { datos: localidades } = useConsulta(() => datos(api.GET("/localidades")), []);
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const f = new FormData(evento.currentTarget);
    const texto = (campo: string) => String(f.get(campo) ?? "").trim();
    const datosNegocio: DatosNegocio = {
      nombre: texto("nombre"),
      localidadId: Number(f.get("localidadId")),
      direccion: texto("direccion"),
      telefono: texto("telefono"),
    };

    const nuevos: Errores = {};
    if (!datosNegocio.nombre) nuevos.nombre = "Escribe el nombre del negocio";
    if (!datosNegocio.localidadId) nuevos.localidadId = "Elige la localidad";
    if (!datosNegocio.direccion) nuevos.direccion = "Escribe la dirección";
    if (datosNegocio.telefono.replace(/\D/g, "").length < 9) nuevos.telefono = "El teléfono debe tener al menos 9 cifras";
    if (esAlta) {
      if (!texto("duenoNombre")) nuevos["dueno.nombre"] = "Escribe el nombre del dueño";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(texto("duenoEmail"))) nuevos["dueno.email"] = "Escribe un email válido";
    }
    setErrores(nuevos);
    setErrorGeneral(undefined);
    if (Object.keys(nuevos).length) return;

    setEnviando(true);
    try {
      const guardado = esAlta
        ? await datos(api.POST("/admin/negocios", {
            body: { ...datosNegocio, dueno: { nombre: texto("duenoNombre"), email: texto("duenoEmail") } },
          }))
        : await datos(api.PUT("/admin/negocios/{id}", { params: { path: { id: negocio.id } }, body: datosNegocio }));
      onGuardado(guardado, esAlta);
    } catch (e) {
      if (e instanceof ErrorApi && e.status === 400 && e.problema?.errores) {
        // "campo: mensaje" → error junto a su campo.
        const delServidor: Errores = {};
        for (const linea of e.problema.errores) {
          const [campo, ...resto] = linea.split(":");
          delServidor[campo.trim() as keyof Errores] = resto.join(":").trim();
        }
        setErrores(delServidor);
      } else {
        setErrorGeneral(e instanceof Error ? e.message : "No se ha podido guardar");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={esAlta ? "Dar de alta un negocio" : "Editar negocio"} abierto={abierto} onCerrar={onCerrar}>
      {/* key: el formulario se vacía cada vez que se abre */}
      <form key={`${abierto}-${negocio?.id}`} onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <h3 className="texto-subtitulo">Negocio</h3>
        <div className="flex flex-col gap-4 sm:flex-row">
          <CampoTexto etiqueta="Nombre del negocio" name="nombre" defaultValue={negocio?.nombre} placeholder="Heladería La Sirena" error={errores.nombre} autoFocus />
          <CampoSelect etiqueta="Localidad" name="localidadId" defaultValue={negocio?.localidad.id ?? ""} error={errores.localidadId}>
            <option value="" disabled>{localidades ? "Elige una localidad" : "Cargando…"}</option>
            {localidades?.map((l) => (
              <option key={l.id} value={l.id}>{l.nombre} ({l.provincia})</option>
            ))}
          </CampoSelect>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <CampoTexto etiqueta="Dirección" name="direccion" defaultValue={negocio?.direccion} placeholder="C/ San Pedro 5" error={errores.direccion} autoComplete="street-address" />
          <CampoTexto etiqueta="Teléfono" name="telefono" type="tel" defaultValue={negocio?.telefono} placeholder="955 821 456" error={errores.telefono} autoComplete="tel" />
        </div>

        {esAlta && (
          <>
            <h3 className="texto-subtitulo">Cuenta del dueño</h3>
            <div className="flex flex-col gap-4 sm:flex-row">
              <CampoTexto etiqueta="Nombre y apellidos" name="duenoNombre" placeholder="Lola Sánchez" error={errores["dueno.nombre"]} autoComplete="off" />
              <CampoTexto etiqueta="Email" name="duenoEmail" type="email" placeholder="lola@heladerialasirena.es" error={errores["dueno.email"]} autoComplete="off" />
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-neutro-fondo px-3.5 py-3">
              <Icono nombre="ojo" />
              <p className="texto-pequeno text-neutro-texto-secundario">
                El dueño recibirá un email para crear su contraseña y entrar en su panel.
              </p>
            </div>
          </>
        )}

        {errorGeneral && <p role="alert" className="texto-pequeno text-estado-error">{errorGeneral}</p>}

        <div className="flex justify-end gap-3">
          <Boton tipo="fantasma" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" disabled={enviando}>
            {enviando ? "Guardando…" : esAlta ? "Crear negocio" : "Guardar cambios"}
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
