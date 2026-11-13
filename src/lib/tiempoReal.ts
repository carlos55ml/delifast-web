"use client";

import { config } from "@/lib/config";

/**
 * Escucha los cambios en los pedidos de un negocio (RF-14). Con Supabase usa Realtime
 * (`postgres_changes` sobre `public.pedidos`, filtrado por `negocio_id`; RLS solo deja pasar
 * las filas del negocio del token). Solo avisa: quien escucha vuelve a pedir los datos a la API,
 * que es la única que da el pedido completo.
 * Con NEXT_PUBLIC_API_MOCK=true usa el Realtime simulado.
 * Devuelve la función para dejar de escuchar.
 */
export function escucharPedidosNegocio(
  negocioId: number,
  alCambiar: (evento: { tipo: "INSERT" | "UPDATE" | "DELETE"; pedidoId?: number }) => void,
): () => void {
  let cancelado = false;
  let cancelar = () => {};

  if (config.apiMock) {
    import("@/lib/api/mock/tiempoReal").then(({ escucharPedidosSimulados }) => {
      if (!cancelado) cancelar = escucharPedidosSimulados(() => alCambiar({ tipo: "INSERT" }));
    });
  } else if (config.supabaseUrl) {
    import("@/lib/supabase/client").then(({ createClient }) => {
      if (cancelado) return;
      const supabase = createClient();
      const canal = supabase
        .channel(`pedidos-negocio-${negocioId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pedidos", filter: `negocio_id=eq.${negocioId}` },
          (payload) => {
            const fila = (payload.new ?? payload.old) as { id?: number } | undefined;
            alCambiar({ tipo: payload.eventType, pedidoId: fila?.id });
          },
        )
        .subscribe();
      cancelar = () => void supabase.removeChannel(canal);
    });
  }

  return () => {
    cancelado = true;
    cancelar();
  };
}
