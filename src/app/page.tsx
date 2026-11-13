import Link from "next/link";

const zonas = [
  { href: "/negocio", titulo: "Negocio", texto: "Pedidos, carta, repartidores e incidencias" },
  { href: "/repartidor", titulo: "Repartidor", texto: "Pedidos listos y repartos en curso" },
  { href: "/admin", titulo: "Administración", texto: "Alta y gestión de negocios" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold text-orange-600">DeliFast</h1>
      <p className="text-zinc-600">Elige tu zona (provisional hasta tener el inicio de sesión)</p>
      <nav className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {zonas.map((zona) => (
          <Link
            key={zona.href}
            href={zona.href}
            className="rounded-xl border border-zinc-200 p-6 transition hover:border-orange-500"
          >
            <h2 className="text-lg font-semibold">{zona.titulo}</h2>
            <p className="text-sm text-zinc-500">{zona.texto}</p>
          </Link>
        ))}
      </nav>
    </main>
  );
}
