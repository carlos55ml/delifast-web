"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Boton } from "@/components/ui/Boton";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { config } from "@/lib/config";

const MINIMO = 8;
type Errores = Partial<Record<"password" | "repetir", string>>;

/**
 * Guarda la contraseña con la sesión de recuperación que abrió /auth/confirmar
 * (`updateUser`). Después cierra la sesión y manda a iniciar sesión con la nueva.
 */
export function FormularioNuevaContrasena() {
  const [errores, setErrores] = useState<Errores>({});
  const [error, setError] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const f = new FormData(evento.currentTarget);
    const password = String(f.get("password") ?? "");
    const repetir = String(f.get("repetir") ?? "");
    const nuevos: Errores = {};
    if (password.length < MINIMO) nuevos.password = `Usa al menos ${MINIMO} caracteres.`;
    else if (!/[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(password) || !/\d/.test(password)) nuevos.password = "Mezcla letras y números.";
    if (repetir !== password) nuevos.repetir = "Las dos contraseñas no coinciden.";
    setErrores(nuevos);
    setError(undefined);
    if (Object.keys(nuevos).length) return;

    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- recarga completa, como al cerrar sesión
    if (config.authMock) return window.location.assign("/login?aviso=contrasena-cambiada");

    setEnviando(true);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error: fallo } = await supabase.auth.updateUser({ password });
    if (fallo) {
      setEnviando(false);
      if (fallo.code === "same_password") setErrores({ password: "Tiene que ser distinta de la anterior." });
      else if (fallo.code === "weak_password") setErrores({ password: "Es demasiado débil. Prueba con una más larga." });
      else if (fallo.status === 401 || fallo.name === "AuthSessionMissingError") setError("expirada");
      else setError(fallo.message);
      return;
    }
    await supabase.auth.signOut();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- recarga completa para que el proxy vea la sesión cerrada
    window.location.assign("/login?aviso=contrasena-cambiada");
  }

  if (error === "expirada") {
    return (
      <p role="alert" className="rounded-xl bg-marca-rojo-claro px-4 py-3 texto-pequeno text-estado-error">
        El enlace ha caducado o ya se ha usado. <Link href="/recuperar" className="font-semibold underline">Pide uno nuevo</Link>.
      </p>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
      <CampoTexto etiqueta="Contraseña nueva" name="password" type="password" autoComplete="new-password" placeholder="••••••••" error={errores.password} autoFocus />
      <CampoTexto etiqueta="Repite la contraseña" name="repetir" type="password" autoComplete="new-password" placeholder="••••••••" error={errores.repetir} />
      <p className="texto-pequeno text-neutro-texto-secundario">Al menos {MINIMO} caracteres, con letras y números.</p>
      {error && <p role="alert" className="texto-pequeno text-estado-error">{error}</p>}
      <Boton type="submit" tamano="grande" disabled={enviando}>{enviando ? "Guardando…" : "Guardar contraseña"}</Boton>
    </form>
  );
}
