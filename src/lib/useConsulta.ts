"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";

type Estado<T> = { clave?: string; datos?: T; error?: Error };

/**
 * Carga datos en el navegador y vuelve a cargarlos cuando cambian las dependencias
 * (deben poder pasarse a JSON). Mientras recarga conserva los datos anteriores.
 * `fijar` actualiza los datos en local tras una mutación sin volver a pedirlos.
 */
export function useConsulta<T>(consulta: () => Promise<T>, dependencias: readonly unknown[]) {
  const [version, setVersion] = useState(0);
  const [estado, setEstado] = useState<Estado<T>>({});
  const clave = `${JSON.stringify(dependencias)}#${version}`;
  const ejecutar = useEffectEvent(() => consulta());

  useEffect(() => {
    let vigente = true;
    ejecutar().then(
      (datos) => vigente && setEstado({ clave, datos }),
      (error: Error) => vigente && setEstado((e) => ({ ...e, clave, error })),
    );
    return () => {
      vigente = false;
    };
  }, [clave]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  const fijar = useCallback((actualizar: (datos: T | undefined) => T) => setEstado((e) => ({ ...e, datos: actualizar(e.datos) })), []);

  const cargando = estado.clave !== clave;
  return { datos: estado.datos, error: cargando ? undefined : estado.error, cargando, recargar, fijar };
}
