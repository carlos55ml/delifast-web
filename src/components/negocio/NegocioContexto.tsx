"use client";

import { createContext, use, type ReactNode } from "react";
import { api, datos } from "@/lib/api/client";
import type { MiNegocio } from "@/lib/api/tipos";
import { useConsulta } from "@/lib/useConsulta";

type Contexto = {
  negocio?: MiNegocio;
  /** Sustituye el negocio en local tras una mutación (p. ej. el interruptor "Abierto"). */
  fijar: (negocio: MiNegocio) => void;
  recargar: () => void;
};

const NegocioContexto = createContext<Contexto>({ fijar: () => {}, recargar: () => {} });

/** Carga GET /negocio para la barra lateral y la cabecera de todo el panel. */
export function ProveedorNegocio({ children }: { children: ReactNode }) {
  const { datos: negocio, fijar, recargar } = useConsulta(() => datos(api.GET("/negocio")), []);
  return <NegocioContexto value={{ negocio, fijar: (n) => fijar(() => n), recargar }}>{children}</NegocioContexto>;
}

export function useNegocio() {
  return use(NegocioContexto);
}
