import type { EstadoPedido } from "@/lib/api/tipos";
import { TEXTO_ESTADO_PEDIDO } from "@/lib/formato";

const estilos: Record<EstadoPedido, { fondo: string; texto: string; punto?: string }> = {
  RECIBIDO: { fondo: "bg-neutro-texto-secundario/12", texto: "text-neutro-texto-secundario", punto: "recibido" },
  EN_PREPARACION: { fondo: "bg-estado-aviso/12", texto: "text-estado-aviso-texto", punto: "preparacion" },
  LISTO: { fondo: "bg-estado-listo-fondo", texto: "text-estado-listo-texto", punto: "listo" },
  EN_REPARTO: { fondo: "bg-marca-naranja/12", texto: "text-marca-naranja-texto", punto: "reparto" },
  ENTREGADO: { fondo: "bg-estado-exito-fondo", texto: "text-estado-exito-texto" },
  RECHAZADO: { fondo: "bg-marca-rojo-claro", texto: "text-estado-error" },
  CANCELADO: { fondo: "bg-marca-rojo-claro", texto: "text-estado-error" },
};

/** "Etiqueta de estado" de Figma: cada estado del pedido con su color y su punto. */
export function EtiquetaEstado({ estado }: { estado: EstadoPedido }) {
  const { fondo, texto, punto } = estilos[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 texto-etiqueta whitespace-nowrap ${fondo} ${texto}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- punto SVG de Figma */}
      {punto && <img src={`/iconos/punto-${punto}.svg`} alt="" width={8} height={8} aria-hidden className="block size-2" />}
      {TEXTO_ESTADO_PEDIDO[estado]}
    </span>
  );
}
