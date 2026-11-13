"use client";

import { config } from "@/lib/config";
import { fijarRolDemo } from "./demo";

/** Cierra la sesión de Supabase (si la hay) y vuelve al inicio de sesión. */
export async function cerrarSesion() {
  if (config.authMock) fijarRolDemo(null);
  else {
    const { createClient } = await import("@/lib/supabase/client");
    await createClient().auth.signOut();
  }
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- recarga completa para limpiar el estado
  window.location.assign("/login");
}
