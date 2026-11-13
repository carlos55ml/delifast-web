import type { MetadataRoute } from "next";

/** La vista del repartidor se instala como app en el móvil (PWA, RF-23). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DeliFast Repartidor",
    short_name: "DeliFast",
    description: "Tus repartos de DeliFast: pedidos asignados, entrega y cobro.",
    start_url: "/repartidor",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fafafa",
    theme_color: "#d63031",
    lang: "es",
    icons: [
      { src: "/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
