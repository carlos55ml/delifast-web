/** Iconos de línea de 24 px exportados de Figma (public/iconos). */
export type NombreIcono =
  | "campana" | "cerrar" | "cerrar-sesion" | "editar" | "incidencia" | "ojo"
  | "resumen" | "resumen-activo" | "negocios" | "negocios-activo" | "incidencias" | "incidencias-activo"
  | "pedidos" | "pedidos-activo" | "carta" | "carta-activo" | "estadisticas" | "estadisticas-activo"
  | "equipo" | "equipo-activo" | "configuracion" | "configuracion-activo"
  | "telefono" | "ubicacion" | "nota" | "papelera" | "moto";

export function Icono({ nombre, className = "" }: { nombre: NombreIcono; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- icono SVG estático de Figma
    <img src={`/iconos/${nombre}.svg`} alt="" width={24} height={24} aria-hidden className={`block size-6 shrink-0 ${className}`} />
  );
}
