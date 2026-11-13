"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Boton } from "@/components/ui/Boton";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { config } from "@/lib/config";

const ERRORES: Record<string, string> = {
  enlace: "El enlace no es válido o ha caducado. Pide otro.",
};

/**
 * Pide a Supabase Auth el email de recuperación (RF-03). El enlace vuelve a /auth/confirmar,
 * que abre la sesión de recuperación y lleva a /nueva-contrasena.
 * Por seguridad, el mensaje es el mismo exista o no la cuenta.
 */
export function FormularioRecuperar() {
  const parametros = useSearchParams();
  const [error, setError] = useState<string | undefined>(ERRORES[parametros.get("error") ?? ""]);
  const [enviado, setEnviado] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const email = String(new FormData(evento.currentTarget).get("email") ?? "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError("Escribe un email válido.");
    setError(undefined);

    if (config.authMock) return setEnviado(email); // modo demostración: no hay Supabase
    if (!config.supabaseUrl) return setError("Falta configurar Supabase en .env.local.");

    setEnviando(true);
    const { createClient } = await import("@/lib/supabase/client");
    const { error: errorSupabase } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirmar?siguiente=/nueva-contrasena`,
    });
    setEnviando(false);
    // 429: demasiados intentos. El resto de errores no se distinguen para no revelar si la cuenta existe.
    if (errorSupabase?.status === 429) return setError("Has pedido demasiados enlaces. Espera unos minutos y vuelve a intentarlo.");
    setEnviado(email);
  }

  if (enviado) {
    return (
      <div role="status" className="flex flex-col gap-2 rounded-xl bg-estado-exito-fondo px-4 py-3">
        <p className="texto-destacado text-estado-exito-texto">Revisa tu correo</p>
        <p className="texto-pequeno">
          Si hay una cuenta con {enviado}, te llegará un enlace para crear una contraseña nueva. Puede tardar un par de minutos;
          mira también en la carpeta de spam.
        </p>
        {config.authMock && <p className="texto-pequeno text-estado-aviso-texto">Modo demostración: no se envía ningún email.</p>}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
      <CampoTexto etiqueta="Email" name="email" type="email" required autoComplete="email" placeholder="tu@email.com" error={error} autoFocus />
      <Boton type="submit" tamano="grande" disabled={enviando}>{enviando ? "Enviando…" : "Enviar enlace"}</Boton>
    </form>
  );
}
