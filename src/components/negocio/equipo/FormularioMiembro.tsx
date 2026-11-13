"use client";

import { useState, type FormEvent } from "react";
import { Boton } from "@/components/ui/Boton";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { Icono } from "@/components/ui/Icono";
import { Modal } from "@/components/ui/Modal";
import { ErrorApi, api, datos, erroresPorCampo } from "@/lib/api/client";
import type { EmpleadoNegocio, RepartidorNegocio } from "@/lib/api/tipos";

export type TipoMiembro = "empleado" | "repartidor";
type Miembro = EmpleadoNegocio | RepartidorNegocio;
type Errores = Partial<Record<"nombre" | "email" | "telefono", string>>;

/**
 * Alta (solo el dueño) o edición de un empleado o repartidor. En el alta la API crea la
 * cuenta y la persona recibe un email para poner su contraseña; el email no se edita después.
 */
export function FormularioMiembro({
  abierto,
  ...props
}: {
  abierto: boolean;
  tipo: TipoMiembro;
  miembro?: Miembro;
  onCerrar: () => void;
  onGuardado: (tipo: TipoMiembro, miembro: Miembro) => void;
}) {
  return (
    <Modal titulo={`${props.miembro ? "Editar" : "Añadir"} ${props.tipo}`} abierto={abierto} onCerrar={props.onCerrar}>
      {abierto && <Contenido key={`${props.tipo}-${props.miembro?.id}`} {...props} />}
    </Modal>
  );
}

function Contenido({ tipo, miembro, onCerrar, onGuardado }: Omit<Parameters<typeof FormularioMiembro>[0], "abierto">) {
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string>();
  const [enviando, setEnviando] = useState(false);
  const esAlta = !miembro;

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const f = new FormData(evento.currentTarget);
    const texto = (campo: string) => String(f.get(campo) ?? "").trim();
    const base = {
      nombre: texto("nombre"),
      telefono: texto("telefono") || null,
    };
    const email = texto("email");
    const nuevos: Errores = {};
    if (!base.nombre) nuevos.nombre = "Escribe el nombre y los apellidos";
    if (base.telefono && base.telefono.replace(/\D/g, "").length < 9) nuevos.telefono = "El teléfono debe tener al menos 9 cifras";
    if (esAlta && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) nuevos.email = "Escribe un email válido";
    setErrores(nuevos);
    setErrorGeneral(undefined);
    if (Object.keys(nuevos).length) return;

    setEnviando(true);
    try {
      let guardado: Miembro;
      if (tipo === "empleado") {
        guardado = esAlta
          ? await datos(api.POST("/negocio/empleados", { body: { ...base, email } }))
          : await datos(
              api.PUT("/negocio/empleados/{id}", {
                params: { path: { id: miembro.id } },
                body: base,
              }),
            );
      } else {
        guardado = esAlta
          ? await datos(api.POST("/negocio/repartidores", { body: { ...base, email } }))
          : await datos(
              api.PUT("/negocio/repartidores/{id}", {
                params: { path: { id: miembro.id } },
                body: base,
              }),
            );
      }
      onGuardado(tipo, guardado);
    } catch (e) {
      const porCampo = erroresPorCampo(e);
      if (porCampo) setErrores(porCampo);
      else if (e instanceof ErrorApi && e.status === 409) setErrores({ email: (e as Error).message });
      else setErrorGeneral((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <CampoTexto
          etiqueta="Nombre y apellidos"
          name="nombre"
          defaultValue={miembro?.nombre}
          placeholder="Marta Díaz"
          maxLength={100}
          error={errores.nombre}
          autoFocus
          autoComplete="off"
        />
        <CampoTexto
          etiqueta="Teléfono (opcional)"
          name="telefono"
          type="tel"
          defaultValue={miembro?.telefono ?? ""}
          placeholder="655 333 444"
          error={errores.telefono}
          autoComplete="off"
        />
      </div>
      {esAlta ? (
        <>
          <CampoTexto etiqueta="Email" name="email" type="email" placeholder="marta@tunegocio.es" error={errores.email} autoComplete="off" />
          <div className="flex items-center gap-2.5 rounded-xl bg-neutro-fondo px-3.5 py-3">
            <Icono nombre="ojo" />
            <p className="texto-pequeno text-neutro-texto-secundario">
              {tipo === "empleado"
                ? "Recibirá un email para crear su contraseña y entrar en el panel del negocio."
                : "Recibirá un email para crear su contraseña y entrar en la vista de repartidor desde el móvil."}
            </p>
          </div>
        </>
      ) : (
        <CampoTexto etiqueta="Email" name="email" value={miembro.email} readOnly disabled title="El email es el de su cuenta y no se puede cambiar" />
      )}

      {errorGeneral && (
        <p role="alert" className="texto-pequeno text-estado-error">
          {errorGeneral}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Boton tipo="fantasma" onClick={onCerrar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : esAlta ? "Crear cuenta" : "Guardar cambios"}
        </Boton>
      </div>
    </form>
  );
}
