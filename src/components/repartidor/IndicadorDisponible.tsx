"use client";

import Link from "next/link";
import { usePerfilRepartidor } from "./PerfilContexto";

/** Pastilla "Disponible" de R01: lleva al perfil, donde se cambia. */
export function IndicadorDisponible() {
  const { perfil } = usePerfilRepartidor();
  if (!perfil) return null;
  return (
    <Link
      href="/repartidor/perfil"
      aria-label={`${perfil.disponible ? "Disponible" : "No disponible"}. Cambiar en el perfil`}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 texto-etiqueta focus-visible:outline-2 focus-visible:outline-marca-rojo ${
        perfil.disponible ? "bg-estado-exito-fondo text-estado-exito-texto" : "bg-neutro-gris text-neutro-texto-secundario"
      }`}
    >
      {perfil.disponible ? (
        // eslint-disable-next-line @next/next/no-img-element -- punto SVG de Figma
        <img src="/iconos/punto-disponible.svg" alt="" width={8} height={8} className="block size-2" />
      ) : (
        <span aria-hidden className="block size-2 rounded-full bg-neutro-texto-secundario" />
      )}
      {perfil.disponible ? "Disponible" : "No disponible"}
    </Link>
  );
}
