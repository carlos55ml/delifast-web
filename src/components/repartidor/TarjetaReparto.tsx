import Link from "next/link";
import { EtiquetaEstado } from "@/components/ui/EtiquetaEstado";
import { Icono } from "@/components/ui/Icono";
import type { RepartoRepartidor } from "@/lib/api/tipos";
import { codigoCorto, euros, hora } from "@/lib/formato";

/** "Tarjeta reparto" de Figma (R01, R05): toda la tarjeta abre el detalle. */
export function TarjetaReparto({ reparto: r }: { reparto: RepartoRepartidor }) {
  const entregado = r.estado === "ENTREGADO";
  const pago = (entregado ? r.metodoCobro : null) ?? r.pedido.metodoPago;
  return (
    <Link
      href={`/repartidor/pedido/${r.id}`}
      className="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.08)] focus-visible:outline-2 focus-visible:outline-marca-rojo"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="truncate texto-destacado">Pedido {codigoCorto(r.pedido.codigo)} · {r.pedido.cliente.nombre}</span>
        <EtiquetaEstado estado={r.estado} />
      </span>
      <span className="flex items-center gap-2.5 texto-normal">
        <Icono nombre="ubicacion" />
        {r.pedido.direccionEntrega}
      </span>
      <span className="flex items-center gap-2.5 texto-pequeno text-neutro-texto-secundario">
        <Icono nombre="reloj" />
        {entregado && r.fechaEntrega ? `Entregado a las ${hora(r.fechaEntrega)}` : `Asignado a las ${hora(r.fechaAsignacion)}`}
      </span>
      <span className="flex items-center gap-2.5 texto-destacado">
        <Icono nombre="efectivo" />
        {euros(r.pedido.total)} · {entregado ? "Cobrado" : "Pago"} {pago === "EFECTIVO" ? "en efectivo" : "con tarjeta"}
      </span>
    </Link>
  );
}
