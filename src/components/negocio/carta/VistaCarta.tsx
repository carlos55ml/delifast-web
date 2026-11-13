"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Icono } from "@/components/ui/Icono";
import { Interruptor } from "@/components/ui/Interruptor";
import { ModalConfirmar } from "@/components/ui/ModalConfirmar";
import { EstadoTabla } from "@/components/ui/Tarjeta";
import { api, datos } from "@/lib/api/client";
import type { CategoriaCarta, ProductoCarta } from "@/lib/api/tipos";
import { euros, plural } from "@/lib/formato";
import { useConsulta } from "@/lib/useConsulta";
import { CabeceraNegocio } from "../CabeceraNegocio";
import { FormularioCategoria } from "./FormularioCategoria";
import { FormularioProducto } from "./FormularioProducto";

const tarjeta = "flex flex-col rounded-2xl bg-white px-6 py-5 shadow-tarjeta";
const botonIcono = "cursor-pointer rounded-md p-0.5 hover:bg-neutro-fondo focus-visible:outline-2 focus-visible:outline-marca-rojo";

/** N03 Carta: categorías a la izquierda y productos de la elegida a la derecha (RF-17). */
export function VistaCarta() {
  const { datos: carta, error, recargar, fijar } = useConsulta(() => datos(api.GET("/negocio/carta")), []);
  const [elegidaId, setElegidaId] = useState<number>();
  const [formCategoria, setFormCategoria] = useState<{ categoria?: CategoriaCarta }>();
  const [formProducto, setFormProducto] = useState<{ producto?: ProductoCarta }>();
  const [borrarCategoria, setBorrarCategoria] = useState<CategoriaCarta>();
  const [borrarProducto, setBorrarProducto] = useState<ProductoCarta>();
  const [errorDisponible, setErrorDisponible] = useState<string>();

  const elegida = carta?.find((c) => c.id === elegidaId) ?? carta?.[0];
  const totalProductos = carta?.reduce((s, c) => s + c.productos.length, 0) ?? 0;
  const subtitulo = carta && `${plural(carta.length, "categoría")} · ${plural(totalProductos, "producto")}`;

  /** Coloca el producto guardado en su categoría (puede haber cambiado de una a otra). */
  const guardarProducto = (producto: ProductoCarta) =>
    fijar((lista = []) =>
      lista.map((c) => {
        if (c.id !== producto.categoriaId) return { ...c, productos: c.productos.filter((p) => p.id !== producto.id) };
        // Mismo sitio si ya estaba en esta categoría; al final si es nuevo o viene de otra.
        const ya = c.productos.some((p) => p.id === producto.id);
        return { ...c, productos: ya ? c.productos.map((p) => (p.id === producto.id ? producto : p)) : [...c.productos, producto] };
      }),
    );

  async function cambiarDisponible(producto: ProductoCarta, disponible: boolean) {
    setErrorDisponible(undefined);
    guardarProducto({ ...producto, disponible }); // optimista: el interruptor responde al momento
    try {
      guardarProducto(await datos(api.PATCH("/negocio/productos/{id}/disponible", { params: { path: { id: producto.id } }, body: { disponible } })));
    } catch (e) {
      guardarProducto(producto);
      setErrorDisponible(`No se ha podido cambiar ${producto.nombre}: ${(e as Error).message}`);
    }
  }

  return (
    <>
      <CabeceraNegocio titulo="Carta" subtitulo={subtitulo} />
      <main className="flex flex-1 flex-col gap-6 px-8 py-7 lg:flex-row lg:items-stretch">
        {error && !carta ? (
          <EstadoTabla error onReintentar={recargar}>No se ha podido cargar la carta. {error.message}</EstadoTabla>
        ) : (
          <>
            <section aria-labelledby="titulo-categorias" className={`${tarjeta} gap-1.5 lg:w-[280px] lg:shrink-0`}>
              <div className="flex items-center justify-between pb-2">
                <h2 id="titulo-categorias" className="texto-subtitulo">Categorías</h2>
                <Boton tipo="fantasma" onClick={() => setFormCategoria({})}>+ Nueva</Boton>
              </div>
              {!carta && <p className="texto-pequeno text-neutro-texto-secundario">Cargando…</p>}
              {carta?.length === 0 && <p className="texto-pequeno text-neutro-texto-secundario">Aún no hay categorías. Crea la primera para añadir productos.</p>}
              <ul className="flex flex-col gap-1.5">
                {carta?.map((c) => {
                  const activa = c.id === elegida?.id;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setElegidaId(c.id)}
                        aria-current={activa ? "true" : undefined}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-[10px] px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-marca-rojo ${
                          activa ? "bg-marca-rojo-claro texto-destacado text-marca-rojo" : "texto-normal hover:bg-neutro-fondo"
                        }`}
                      >
                        {c.nombre}
                        <span className="texto-pequeno text-neutro-texto-secundario">{c.productos.length}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section aria-labelledby="titulo-productos" className={`${tarjeta} min-w-0 flex-1`}>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-2">
                  <h2 id="titulo-productos" className="texto-subtitulo">{elegida?.nombre ?? "Productos"}</h2>
                  {elegida && (
                    <>
                      <button type="button" className={botonIcono} aria-label={`Renombrar ${elegida.nombre}`} onClick={() => setFormCategoria({ categoria: elegida })}>
                        <Icono nombre="editar" className="size-5" />
                      </button>
                      <button type="button" className={botonIcono} aria-label={`Borrar ${elegida.nombre}`} onClick={() => setBorrarCategoria(elegida)}>
                        <Icono nombre="papelera" className="size-5" />
                      </button>
                    </>
                  )}
                </div>
                <Boton onClick={() => setFormProducto({})} disabled={!elegida}>+ Nuevo producto</Boton>
              </div>

              {errorDisponible && <p role="alert" className="pb-2 texto-pequeno text-estado-error">{errorDisponible}</p>}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse">
                  <thead>
                    <tr className="border-b border-neutro-borde text-left texto-etiqueta text-neutro-texto-secundario">
                      <th scope="col" className="py-2 pr-4 font-medium">Producto</th>
                      <th scope="col" className="w-[110px] py-2 pr-4 font-medium">Precio</th>
                      <th scope="col" className="w-[150px] py-2 pr-4 font-medium">Disponible</th>
                      <th scope="col" className="w-[80px] py-2"><span className="sr-only">Acciones</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {elegida?.productos.map((p) => (
                      <tr key={p.id} className="border-b border-neutro-borde">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <FotoProducto producto={p} />
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <span className="texto-destacado">{p.nombre}</span>
                              {p.descripcion && <span className="texto-pequeno text-neutro-texto-secundario">{p.descripcion}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 texto-destacado whitespace-nowrap">{euros(p.precio)}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <Interruptor
                              activado={p.disponible}
                              onChange={(v) => cambiarDisponible(p, v)}
                              etiqueta={p.disponible ? `Marcar ${p.nombre} como agotado` : `Marcar ${p.nombre} como disponible`}
                            />
                            <span className={`texto-pequeno ${p.disponible ? "text-neutro-texto-secundario" : "text-estado-error"}`}>{p.disponible ? "Sí" : "Agotado"}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex justify-end gap-3">
                            <button type="button" className={botonIcono} aria-label={`Editar ${p.nombre}`} onClick={() => setFormProducto({ producto: p })}>
                              <Icono nombre="editar" />
                            </button>
                            <button type="button" className={botonIcono} aria-label={`Borrar ${p.nombre}`} onClick={() => setBorrarProducto(p)}>
                              <Icono nombre="papelera" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {elegida && elegida.productos.length === 0 && (
                  <p className="py-6 texto-normal text-neutro-texto-secundario">Esta categoría aún no tiene productos.</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <FormularioCategoria
        abierto={!!formCategoria}
        categoria={formCategoria?.categoria}
        onCerrar={() => setFormCategoria(undefined)}
        onGuardada={(c) => {
          fijar((lista = []) => (lista.some((x) => x.id === c.id) ? lista.map((x) => (x.id === c.id ? { ...x, nombre: c.nombre } : x)) : [...lista, c]));
          setElegidaId(c.id);
          setFormCategoria(undefined);
        }}
      />
      <FormularioProducto
        abierto={!!formProducto}
        producto={formProducto?.producto}
        categorias={carta ?? []}
        categoriaInicial={elegida?.id}
        onCerrar={() => setFormProducto(undefined)}
        onGuardado={(p) => {
          guardarProducto(p);
          setElegidaId(p.categoriaId);
          setFormProducto(undefined);
        }}
      />
      <ModalConfirmar
        titulo="Borrar categoría"
        abierto={!!borrarCategoria}
        onCerrar={() => setBorrarCategoria(undefined)}
        onConfirmar={async () => {
          const c = borrarCategoria!;
          await datos(api.DELETE("/negocio/categorias/{id}", { params: { path: { id: c.id } } }));
          fijar((lista = []) => lista.filter((x) => x.id !== c.id));
          setElegidaId(undefined);
        }}
      >
        ¿Borrar la categoría «{borrarCategoria?.nombre}»? Solo se puede borrar si no tiene productos.
      </ModalConfirmar>
      <ModalConfirmar
        titulo="Borrar producto"
        abierto={!!borrarProducto}
        onCerrar={() => setBorrarProducto(undefined)}
        onConfirmar={async () => {
          const p = borrarProducto!;
          await datos(api.DELETE("/negocio/productos/{id}", { params: { path: { id: p.id } } }));
          fijar((lista = []) => lista.map((c) => ({ ...c, productos: c.productos.filter((x) => x.id !== p.id) })));
        }}
      >
        ¿Borrar «{borrarProducto?.nombre}» de la carta? Los pedidos antiguos lo conservan.
      </ModalConfirmar>
    </>
  );
}

/** Foto del producto (Supabase Storage) o el hueco rojo claro de Figma si no tiene. */
export function FotoProducto({ producto, tamano = 48 }: { producto: Pick<ProductoCarta, "fotoUrl" | "nombre">; tamano?: number }) {
  if (!producto.fotoUrl) return <span aria-hidden className="block shrink-0 rounded-[10px] bg-marca-rojo-claro" style={{ width: tamano, height: tamano }} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- la foto viene de Supabase Storage (o de un blob: en el simulador)
    <img src={producto.fotoUrl} alt="" width={tamano} height={tamano} className="block shrink-0 rounded-[10px] object-cover" style={{ width: tamano, height: tamano }} />
  );
}
