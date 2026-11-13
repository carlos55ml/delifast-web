import type { Metadata } from "next";
import { VistaMisPedidos } from "@/components/repartidor/VistaMisPedidos";

export const metadata: Metadata = { title: "Mis pedidos" };

/** R01 / R05 Mis pedidos. */
export default function PaginaMisPedidos() {
  return <VistaMisPedidos />;
}
