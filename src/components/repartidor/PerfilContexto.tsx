"use client";

import { createContext, use, type ReactNode } from "react";
import { api, datos } from "@/lib/api/client";
import type { PerfilRepartidor } from "@/lib/api/tipos";
import { useConsulta } from "@/lib/useConsulta";

type Contexto = { perfil?: PerfilRepartidor; fijar: (p: PerfilRepartidor) => void; recargar: () => void };
const PerfilContexto = createContext<Contexto>({ fijar: () => {}, recargar: () => {} });

/** GET /repartidor/perfil, compartido por la cabecera (Disponible) y la pantalla de perfil. */
export function ProveedorPerfilRepartidor({ children }: { children: ReactNode }) {
  const { datos: perfil, fijar, recargar } = useConsulta(() => datos(api.GET("/repartidor/perfil")), []);
  return <PerfilContexto value={{ perfil, fijar: (p) => fijar(() => p), recargar }}>{children}</PerfilContexto>;
}

export function usePerfilRepartidor() {
  return use(PerfilContexto);
}
