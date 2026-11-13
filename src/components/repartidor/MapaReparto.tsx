"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

/**
 * Mapa de R02 con Leaflet y teselas de OpenStreetMap (RF-24). Leaflet usa `window`, así que
 * se carga con import() al montar. Sin coordenadas se muestra el hueco del prototipo.
 */
export function MapaReparto({ latitud, longitud, direccion }: { latitud?: number | null; longitud?: number | null; direccion: string }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const hayPosicion = typeof latitud === "number" && typeof longitud === "number";

  useEffect(() => {
    if (!hayPosicion || !contenedor.current) return;
    let mapa: import("leaflet").Map | undefined;
    let cancelado = false;
    import("leaflet").then((L) => {
      if (cancelado || !contenedor.current) return;
      mapa = L.map(contenedor.current, { zoomControl: false, attributionControl: true }).setView([latitud, longitud], 16);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapa);
      const icono = L.icon({ iconUrl: "/iconos/pin-mapa.svg", iconSize: [32, 32], iconAnchor: [16, 30] });
      L.marker([latitud, longitud], { icon: icono, alt: direccion, keyboard: false }).addTo(mapa);
    });
    return () => {
      cancelado = true;
      mapa?.remove();
    };
  }, [hayPosicion, latitud, longitud, direccion]);

  if (!hayPosicion) {
    return (
      <div className="flex h-[150px] items-center justify-center rounded-2xl bg-[#e5ede3] px-4 text-center texto-pequeno text-neutro-texto-secundario">
        Sin ubicación en el mapa. Usa «Abrir ruta» para buscar la dirección.
      </div>
    );
  }
  return <div ref={contenedor} role="img" aria-label={`Mapa con la dirección de entrega: ${direccion}`} className="z-0 h-[150px] overflow-hidden rounded-2xl bg-[#e5ede3]" />;
}
