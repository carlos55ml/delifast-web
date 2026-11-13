/** Filtro tipo chip ("Chip categoría" de Figma). */
export function Chip({ texto, seleccionado, onClick }: { texto: string; seleccionado: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={seleccionado}
      className={`shrink-0 cursor-pointer rounded-full px-4 py-2 texto-destacado transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-rojo ${
        seleccionado ? "bg-marca-rojo text-white" : "border border-neutro-borde bg-white text-neutro-texto hover:bg-neutro-fondo"
      }`}
    >
      {texto}
    </button>
  );
}
