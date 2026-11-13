import type { Metadata } from "next";
import { VistaPedidos } from "@/components/negocio/pedidos/VistaPedidos";

export const metadata: Metadata = { title: "Pedidos" };

/** N01 Pedidos (tablero en tiempo real). */
export default function PaginaPedidos() {
  return <VistaPedidos />;
}
