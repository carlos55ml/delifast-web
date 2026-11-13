"use client";

import { useState } from "react";
import { Cabecera } from "@/components/panel/Cabecera";
import { Interruptor } from "@/components/ui/Interruptor";
import { api, datos } from "@/lib/api/client";
import { useNegocio } from "./NegocioContexto";

/** "Cabecera web" con "Mostrar abierto": el interruptor abre o cierra el negocio a mano (RF-18). */
export function CabeceraNegocio({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return <Cabecera titulo={titulo} subtitulo={subtitulo} acciones={<InterruptorAbierto />} />;
}

function InterruptorAbierto() {
  const { negocio, fijar } = useNegocio();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string>();
  if (!negocio) return null;

  async function cambiar(abierto: boolean) {
    setGuardando(true);
    setError(undefined);
    try {
      fijar(await datos(api.PATCH("/negocio/abierto", { body: { abierto } })));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex items-center gap-2" title={error}>
      <Interruptor
        activado={negocio.abiertoManual}
        onChange={cambiar}
        deshabilitado={guardando}
        etiqueta={negocio.abiertoManual ? "Cerrar el negocio: dejar de aceptar pedidos" : "Abrir el negocio: aceptar pedidos"}
      />
      <span className={`texto-destacado ${error ? "text-estado-error" : negocio.abierto ? "text-estado-exito-texto" : "text-neutro-texto-secundario"}`}>
        {error ? "Error" : negocio.abierto ? "Abierto" : negocio.abiertoManual ? "Fuera de horario" : "Cerrado"}
      </span>
    </div>
  );
}
