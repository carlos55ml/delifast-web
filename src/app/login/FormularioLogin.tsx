"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Boton } from "@/components/ui/Boton";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { fijarRolDemo } from "@/lib/auth/demo";
import { ZONA_POR_ROL, rolDesdeClaims } from "@/lib/auth/roles";
import type { Rol } from "@/lib/api/tipos";
import { config } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

const MENSAJES: Record<string, string> = {
  "sin-acceso": "Tu cuenta no tiene acceso a la web.",
};

export function FormularioLogin() {
  const parametros = useSearchParams();
  const [error, setError] = useState<string | undefined>(MENSAJES[parametros.get("error") ?? ""]);
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!config.supabaseUrl) {
      setError("Falta configurar Supabase en .env.local (o activa NEXT_PUBLIC_AUTH_MOCK para desarrollar sin él).");
      return;
    }
    const f = new FormData(evento.currentTarget);
    setEnviando(true);
    setError(undefined);
    const supabase = createClient();
    const { error: errorLogin } = await supabase.auth.signInWithPassword({
      email: String(f.get("email")).trim(),
      password: String(f.get("password")),
    });
    if (errorLogin) {
      setEnviando(false);
      // Supabase devuelve 403 desde el hook si la cuenta o su negocio están desactivados.
      setError(errorLogin.status === 403 ? "Tu cuenta o tu negocio están desactivados. Habla con el administrador." : "El email o la contraseña no son correctos.");
      return;
    }

    const { data } = await supabase.auth.getClaims();
    const rol = rolDesdeClaims(data?.claims as Record<string, unknown> | undefined);
    const zona = rol ? ZONA_POR_ROL[rol] : null;
    if (!zona) {
      await supabase.auth.signOut();
      setEnviando(false);
      setError("Las cuentas de cliente se usan en la app móvil de DeliFast.");
      return;
    }
    const siguiente = parametros.get("siguiente");
    // Recarga completa para que el proxy vea las cookies de la sesión nueva.
    window.location.assign(siguiente?.startsWith(zona) ? siguiente : zona);
  }

  if (config.authMock) return <EntradaDemo />;

  return (
    <form onSubmit={entrar} className="flex flex-col gap-5">
      <CampoTexto etiqueta="Email" name="email" type="email" required autoComplete="email" placeholder="tu@email.com" />
      <CampoTexto etiqueta="Contraseña" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
      {error && <p role="alert" className="texto-pequeno text-estado-error">{error}</p>}
      <Boton type="submit" tamano="grande" disabled={enviando}>{enviando ? "Entrando…" : "Iniciar sesión"}</Boton>
    </form>
  );
}

function entrarDemo(rol: Rol) {
  fijarRolDemo(rol);
  window.location.assign(ZONA_POR_ROL[rol]!);
}

/** Con NEXT_PUBLIC_AUTH_MOCK=true no hay Supabase: se elige con qué rol entrar. */
function EntradaDemo() {
  return (
    <div className="flex flex-col gap-3">
      <p role="note" className="rounded-[10px] bg-estado-aviso-fondo px-3 py-2 texto-pequeno text-estado-aviso-texto">
        Modo demostración: elige con qué cuenta de ejemplo entrar.
      </p>
      <Boton tamano="grande" onClick={() => entrarDemo("NEGOCIO")}>Entrar como negocio</Boton>
      <Boton tamano="grande" tipo="fantasma" onClick={() => entrarDemo("REPARTIDOR")}>Entrar como repartidor</Boton>
      <Boton tamano="grande" tipo="fantasma" onClick={() => entrarDemo("ADMINISTRADOR")}>Entrar como administrador</Boton>
    </div>
  );
}
