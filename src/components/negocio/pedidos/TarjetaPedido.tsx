import { Boton } from "@/components/ui/Boton";
import type { PedidoNegocio } from "@/lib/api/tipos";
import { TEXTO_METODO_PAGO, codigoCorto, euros, hora, resumenLineas } from "@/lib/formato";

/**
 * "Tarjeta pedido" de Figma. `nuevo` resalta un pedido recién llegado (borde rojo e insignia).
 * Toda la tarjeta abre el detalle; el botón hace la acción del estado.
 */
export function TarjetaPedido({ pedido, nuevo, accion, ocupado, onAbrir }: {
  pedido: PedidoNegocio;
  nuevo?: boolean;
  accion?: { texto: string; ejecutar: () => void };
  ocupado?: boolean;
  onAbrir: () => void;
}) {
  return (
    <article
      onClick={onAbrir}
      aria-label={`Pedido ${codigoCorto(pedido.codigo)} de ${pedido.cliente.nombre}${nuevo ? ", nuevo" : ""}`}
      className={`flex w-full cursor-pointer flex-col gap-2.5 rounded-[14px] bg-white p-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.08)] transition hover:drop-shadow-[0_6px_12px_rgba(0,0,0,0.12)] ${
        nuevo ? "border-2 border-marca-rojo p-[14px]" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Botón real para el teclado y los lectores de pantalla; el clic en la tarjeta es un atajo. */}
        <button type="button" onClick={(e) => { e.stopPropagation(); onAbrir(); }} className="cursor-pointer rounded texto-destacado focus-visible:outline-2 focus-visible:outline-marca-rojo">
          {codigoCorto(pedido.codigo)}
        </button>
        <div className="flex items-center gap-2">
          {nuevo && <span className="rounded-full bg-marca-rojo px-2 py-0.5 texto-etiqueta text-white">Nuevo</span>}
          <time dateTime={pedido.fechaCreacion} className="texto-pequeno text-neutro-texto-secundario">{hora(pedido.fechaCreacion)}</time>
        </div>
      </div>
      <p className="texto-normal">{pedido.cliente.nombre}</p>
      <p className="texto-pequeno text-neutro-texto-secundario">{resumenLineas(pedido.lineas)}</p>
      <div className="h-px w-full bg-neutro-borde" />
      <div className="flex items-center justify-between">
        <p className="texto-destacado">{euros(pedido.total)}</p>
        <p className="texto-etiqueta text-neutro-texto-secundario">{TEXTO_METODO_PAGO[pedido.metodoPago]}</p>
      </div>
      {accion && (
        <Boton
          className="w-full"
          disabled={ocupado}
          onClick={(e) => {
            e.stopPropagation();
            accion.ejecutar();
          }}
        >
          {ocupado ? "Guardando…" : accion.texto}
        </Boton>
      )}
    </article>
  );
}
