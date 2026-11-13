import type { Metadata } from "next";
import { Suspense } from "react";
import { VistaDetalleReparto } from "@/components/repartidor/VistaDetalleReparto";

export const metadata: Metadata = { title: "Pedido" };

/** R02 Detalle del pedido. El id se lee en el cliente (useParams), dentro de Suspense por Cache Components. */
export default function PaginaPedido() {
  return (
    <Suspense>
      <VistaDetalleReparto />
    </Suspense>
  );
}
