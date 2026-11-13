"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Icono } from "@/components/ui/Icono";
import { iniciales } from "@/lib/formato";
import { useUsuario } from "./UsuarioContexto";

/** "Cabecera web" de Figma. `acciones` va antes de la campana (el interruptor "Abierto" del negocio). */
export function Cabecera({ titulo, subtitulo, acciones }: { titulo: string; subtitulo?: string; acciones?: ReactNode }) {
  const usuario = useUsuario();
  return (
    <header className="flex h-20 shrink-0 items-center justify-between gap-6 border-b border-neutro-borde bg-white px-8">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="truncate texto-titulo-l">{titulo}</h1>
        <p className="min-h-[18px] texto-pequeno text-neutro-texto-secundario">{subtitulo}</p>
      </div>
      <div className="flex shrink-0 items-center gap-5">
        {acciones}
        <Icono nombre="campana" />
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-marca-rojo-claro texto-destacado text-marca-rojo" aria-hidden>
            {usuario ? iniciales(usuario.nombre) : ""}
          </span>
          <span className="texto-destacado">{usuario?.nombre}</span>
        </div>
      </div>
    </header>
  );
}

/** Fecha de hoy calculada en el navegador (con Cache Components no se puede usar new Date() al prerenderizar). */
export function useFechaDeHoy() {
  const [hoy, setHoy] = useState<Date>();
  // eslint-disable-next-line react-hooks/set-state-in-effect -- la fecha solo existe en el navegador
  useEffect(() => setHoy(new Date()), []);
  return hoy;
}
