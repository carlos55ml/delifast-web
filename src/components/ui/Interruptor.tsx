/** Interruptor 44×24 (componente "Interruptor" de Figma, variantes Activado/Desactivado). */
export function Interruptor({
  activado,
  onChange,
  etiqueta,
  deshabilitado,
}: {
  activado: boolean;
  onChange: (valor: boolean) => void;
  etiqueta: string;
  deshabilitado?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activado}
      aria-label={etiqueta}
      disabled={deshabilitado}
      onClick={() => onChange(!activado)}
      className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-rojo disabled:cursor-wait disabled:opacity-60"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- icono SVG estático de Figma */}
      <img
        src={activado ? "/iconos/interruptor-activado.svg" : "/iconos/interruptor-desactivado.svg"}
        alt=""
        width={44}
        height={24}
        className="block"
      />
    </button>
  );
}
