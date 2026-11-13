"use client";

import { useEffect, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { EstadoTabla } from "@/components/ui/Tarjeta";
import { api, datos } from "@/lib/api/client";
import { sonarAvisoPedido } from "@/lib/avisoSonoro";
import { escucharRepartos } from "@/lib/tiempoReal";
import { useConsulta } from "@/lib/useConsulta";
import { BarraInferior } from "./BarraInferior";
import { CabeceraMovil } from "./CabeceraMovil";
import { IndicadorDisponible } from "./IndicadorDisponible";
import { usePerfilRepartidor } from "./PerfilContexto";
import { TarjetaReparto } from "./TarjetaReparto";

const FILTROS = [
  { texto: "En reparto", estado: "EN_REPARTO", vacio: "No tienes pedidos por entregar. Cuando el negocio te asigne uno, aparecerá aquí." },
  { texto: "Entregados", estado: "ENTREGADO", vacio: "Aún no has entregado ningún pedido hoy." },
  { texto: "Todos", estado: undefined, vacio: "Aún no tienes pedidos hoy." },
] as const;

/** R01 / R05 Mis pedidos (RF-23): los que le ha asignado el negocio, al momento por Realtime. */
export function VistaMisPedidos() {
  const [filtro, setFiltro] = useState(0);
  const { perfil, recargar: recargarPerfil } = usePerfilRepartidor();
  const { estado, vacio } = FILTROS[filtro]!;
  const { datos: repartos, error, recargar } = useConsulta(
    () => datos(api.GET("/repartidor/repartos", { params: { query: estado ? { estado } : {} } })),
    [estado],
  );

  const repartidorId = perfil?.id;
  useEffect(() => {
    if (!repartidorId) return;
    return escucharRepartos(repartidorId, () => {
      sonarAvisoPedido();
      recargar();
      recargarPerfil();
    });
  }, [repartidorId, recargar, recargarPerfil]);

  return (
    <>
      <CabeceraMovil titulo="Mis pedidos" subtitulo={perfil && `Asignados por ${perfil.negocio.nombre}`} derecha={<IndicadorDisponible />} />
      <main className="flex flex-1 flex-col gap-3 p-4">
        <div role="group" aria-label="Filtrar pedidos" className="flex gap-2 overflow-x-auto">
          {FILTROS.map((f, i) => (
            <Chip key={f.texto} texto={f.texto} seleccionado={filtro === i} onClick={() => setFiltro(i)} />
          ))}
        </div>
        <p className="texto-pequeno text-neutro-texto-secundario">Pedidos que te ha asignado el negocio. Toca uno para ver el detalle.</p>
        {error && !repartos && <EstadoTabla error onReintentar={recargar}>No se han podido cargar tus pedidos.</EstadoTabla>}
        {!error && !repartos && <p className="texto-pequeno text-neutro-texto-secundario">Cargando…</p>}
        {repartos?.length === 0 && <p className="rounded-2xl bg-white p-4 texto-normal text-neutro-texto-secundario">{vacio}</p>}
        {repartos?.map((r) => <TarjetaReparto key={r.id} reparto={r} />)}
      </main>
      <BarraInferior />
    </>
  );
}
