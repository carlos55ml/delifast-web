/**
 * Cliente de la API REST de DeliFast (Spring Boot).
 * La web llama a la API desde el navegador con el token del usuario.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function apiFetch<T>(ruta: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");

  const respuesta = await fetch(`${API_URL}${ruta}`, { ...init, headers });
  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status} en ${ruta}`);
  }
  return respuesta.status === 204 ? (undefined as T) : respuesta.json();
}
