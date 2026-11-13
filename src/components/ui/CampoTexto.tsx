import { useId, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

const caja =
  "h-[52px] w-full rounded-xl border border-neutro-borde bg-white px-4 texto-normal text-neutro-texto placeholder:text-neutro-texto-secundario outline-none focus:border-2 focus:border-marca-rojo focus:px-[15px] aria-invalid:border-estado-error";

type Comunes = { etiqueta: string; error?: string };

/** Campo con etiqueta ("Campo de texto" de Figma: estados normal, foco y error). */
export function CampoTexto({ etiqueta, error, className = "", ...props }: Comunes & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="texto-etiqueta text-neutro-texto-secundario">{etiqueta}</label>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} className={caja} {...props} />
      {error && <p id={`${id}-error`} className="texto-etiqueta text-estado-error">{error}</p>}
    </div>
  );
}

export function CampoSelect({ etiqueta, error, className = "", children, ...props }: Comunes & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="texto-etiqueta text-neutro-texto-secundario">{etiqueta}</label>
      <select id={id} aria-invalid={error ? true : undefined} className={`${caja} cursor-pointer`} {...props}>
        {children}
      </select>
      {error && <p className="texto-etiqueta text-estado-error">{error}</p>}
    </div>
  );
}
