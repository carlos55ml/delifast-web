"use client";

import { createContext, use, type ReactNode } from "react";
import { api, datos } from "@/lib/api/client";
import type { Perfil } from "@/lib/api/tipos";
import { useConsulta } from "@/lib/useConsulta";

const UsuarioContexto = createContext<Perfil | undefined>(undefined);

/** Carga una vez el perfil (GET /me) para la barra lateral y la cabecera. */
export function ProveedorUsuario({ children }: { children: ReactNode }) {
  const { datos: perfil } = useConsulta(() => datos(api.GET("/me")), []);
  return <UsuarioContexto value={perfil}>{children}</UsuarioContexto>;
}

export function useUsuario() {
  return use(UsuarioContexto);
}
