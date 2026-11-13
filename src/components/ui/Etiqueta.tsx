const estilos = {
  exito: "bg-estado-exito-fondo text-estado-exito-texto",
  aviso: "bg-estado-aviso-fondo text-estado-aviso-texto",
  neutro: "bg-neutro-gris text-neutro-texto-secundario",
} as const;

/** Etiqueta de estado redondeada ("Abierto", "Cerrado", "Abierta"...). */
export function Etiqueta({ texto, tono }: { texto: string; tono: keyof typeof estilos }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 texto-etiqueta whitespace-nowrap ${estilos[tono]}`}>{texto}</span>;
}
