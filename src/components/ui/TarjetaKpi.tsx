/** Indicador numérico ("Tarjeta KPI" de Figma). */
export function TarjetaKpi({ etiqueta, valor, detalle, tono = "exito" }: {
  etiqueta: string;
  valor: string | number;
  detalle: string;
  /** Color del detalle: verde si mejora, rojo si empeora, gris si no hay con qué comparar. */
  tono?: "exito" | "error" | "neutro";
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-2xl bg-white p-5 drop-shadow-[0_4px_8px_rgba(0,0,0,0.08)]">
      <p className="texto-pequeno text-neutro-texto-secundario">{etiqueta}</p>
      <p className="font-display text-[28px] leading-9 font-bold">{valor}</p>
      <p className={`texto-etiqueta ${{ exito: "text-estado-exito-texto", error: "text-estado-error", neutro: "text-neutro-texto-secundario" }[tono]}`}>{detalle}</p>
    </div>
  );
}
