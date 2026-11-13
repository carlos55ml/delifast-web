import { config } from "@/lib/config";

/** Banda que avisa de que la web usa datos o sesión simulados. */
export function AvisoModo() {
  if (!config.apiMock && !config.authMock) return null;
  const partes = [config.apiMock && "datos de ejemplo", config.authMock && "sesión de demostración"].filter(Boolean);
  return (
    <p role="note" className="bg-estado-aviso-fondo px-8 py-1.5 texto-etiqueta text-estado-aviso-texto">
      Modo desarrollo: {partes.join(" y ")}. Los cambios no se guardan en la API real.
    </p>
  );
}
