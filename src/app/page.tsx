import { redirect } from "next/navigation";

/** El proxy ya manda a cada usuario a su zona; sin sesión, al inicio de sesión. */
export default function Inicio() {
  redirect("/login");
}
