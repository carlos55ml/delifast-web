import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Primario = degradado de marca; Fantasma = blanco con borde; Peligro = rojo claro (componente "Botón web"). */
  tipo?: "primario" | "fantasma" | "peligro";
  /** "web" = 40 px (Botón web); "grande" = 52 px a todo el ancho (Botón, usado en el login). */
  tamano?: "web" | "grande";
};

export function Boton({ tipo = "primario", tamano = "web", className = "", type = "button", ...props }: Props) {
  const base =
    tamano === "grande"
      ? "h-[52px] w-full rounded-[14px] px-6 font-display text-base leading-6 font-semibold"
      : "rounded-[10px] px-[18px] py-2.5 texto-destacado";
  const estilo = {
    primario: "degradado-marca text-white hover:brightness-105",
    fantasma: "border-[1.5px] border-neutro-borde bg-white text-neutro-texto hover:bg-neutro-fondo",
    peligro: "bg-marca-rojo-claro text-estado-error hover:brightness-95",
  }[tipo];
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-rojo disabled:cursor-not-allowed disabled:opacity-60 ${base} ${estilo} ${className}`}
      {...props}
    />
  );
}
