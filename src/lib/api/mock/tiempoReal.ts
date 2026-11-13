import { crearPedido, miNegocio, pedidos, pedidosEntrantes } from "./datosNegocio";

/**
 * Realtime simulado: hace de Supabase Realtime cuando NEXT_PUBLIC_API_MOCK=true. Cada cierto
 * tiempo llega un pedido nuevo al negocio de ejemplo y avisa a quien esté escuchando, igual que
 * haría `postgres_changes` sobre `public.pedidos`.
 */

const PRIMER_AVISO_MS = 25_000;
const INTERVALO_MS = 90_000;

const oyentes = new Set<() => void>();
let temporizador: ReturnType<typeof setTimeout> | undefined;

function llegaPedido() {
  const datos = pedidosEntrantes.shift();
  if (!datos) return;
  pedidos.push(crearPedido(datos));
  miNegocio.pedidosHoy++;
  oyentes.forEach((avisar) => avisar());
  temporizador = setTimeout(llegaPedido, INTERVALO_MS);
}

export function escucharPedidosSimulados(alCambiar: () => void): () => void {
  oyentes.add(alCambiar);
  temporizador ??= setTimeout(llegaPedido, PRIMER_AVISO_MS);
  return () => {
    oyentes.delete(alCambiar);
  };
}
