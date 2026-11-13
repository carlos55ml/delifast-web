"use client";

import { BarraLateral, type Seccion } from "@/components/panel/BarraLateral";
import { useUsuario } from "@/components/panel/UsuarioContexto";
import { useNegocio } from "./NegocioContexto";

/** En la v1 todas las personas del negocio ven todas las secciones (Figma, "Barra lateral/Negocio"). */
const secciones: Seccion[] = [
  { href: "/negocio", texto: "Pedidos", icono: "pedidos" },
  { href: "/negocio/carta", texto: "Carta", icono: "carta" },
  { href: "/negocio/incidencias", texto: "Incidencias", icono: "incidencias" },
  { href: "/negocio/estadisticas", texto: "Estadísticas", icono: "estadisticas" },
  { href: "/negocio/equipo", texto: "Equipo", icono: "equipo" },
  { href: "/negocio/configuracion", texto: "Configuración", icono: "configuracion" },
];

export function BarraLateralNegocio() {
  const usuario = useUsuario();
  const { negocio } = useNegocio();
  const descripcion = usuario && negocio ? `${usuario.esDueno ? "Dueño" : "Empleado"} · ${negocio.nombre}` : undefined;
  return <BarraLateral etiqueta="Panel del negocio" secciones={secciones} descripcionUsuario={descripcion} />;
}
