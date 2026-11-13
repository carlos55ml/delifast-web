"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icono, type NombreIcono } from "@/components/ui/Icono";

const pestanas: { href: string; texto: string; icono: NombreIcono }[] = [
  { href: "/repartidor", texto: "Mis pedidos", icono: "moto" },
  { href: "/repartidor/perfil", texto: "Perfil", icono: "perfil" },
];

/** "Barra inferior" de la vista del repartidor. */
export function BarraInferior() {
  const ruta = usePathname();
  return (
    <nav aria-label="Secciones" className="sticky bottom-0 flex h-[72px] shrink-0 items-start justify-around border-t border-neutro-borde bg-white pt-2.5 pb-3.5">
      {pestanas.map(({ href, texto, icono }) => {
        const activa = ruta === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={activa ? "page" : undefined}
            className={`flex min-w-24 flex-col items-center gap-1 rounded-md texto-etiqueta focus-visible:outline-2 focus-visible:outline-marca-rojo ${activa ? "text-marca-rojo" : "text-neutro-texto-secundario"}`}
          >
            <Icono nombre={activa ? (`${icono}-activo` as NombreIcono) : icono} />
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}
