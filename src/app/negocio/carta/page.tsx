import type { Metadata } from "next";
import { VistaCarta } from "@/components/negocio/carta/VistaCarta";

export const metadata: Metadata = { title: "Carta" };

/** N03 Carta. */
export default function PaginaCarta() {
  return <VistaCarta />;
}
