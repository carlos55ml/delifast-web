/** Logotipo DeliFast (componente "Logo" de Figma): líneas de velocidad + "Deli" "Fast". */
export function Logo({ variante = "color", tamano = 30.77 }: { variante?: "color" | "blanco"; tamano?: number }) {
  const escala = tamano / 30.77;
  const linea = variante === "color" ? "degradado-marca" : "bg-white";
  const anchos = [13.846, 20, 10.769];
  return (
    <div className="flex items-center" style={{ gap: 6.154 * escala }} aria-label="DeliFast" role="img">
      <div className="flex flex-col items-end" style={{ gap: 3.846 * escala }} aria-hidden>
        {anchos.map((ancho) => (
          <span
            key={ancho}
            className={`block ${linea}`}
            style={{ width: ancho * escala, height: 3.846 * escala, borderRadius: 2.308 * escala }}
          />
        ))}
      </div>
      <p
        className="flex font-display leading-normal font-bold whitespace-nowrap"
        style={{ fontSize: tamano, letterSpacing: -0.02 * tamano }}
        aria-hidden
      >
        <span className={variante === "color" ? "text-marca-rojo" : "text-white"}>Deli</span>
        <span className={`italic ${variante === "color" ? "text-marca-naranja" : "text-white"}`}>Fast</span>
      </p>
    </div>
  );
}
