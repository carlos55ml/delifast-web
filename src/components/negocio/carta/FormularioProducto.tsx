"use client";

import { useState, type FormEvent } from "react";
import { Boton } from "@/components/ui/Boton";
import { CampoSelect, CampoTexto } from "@/components/ui/CampoTexto";
import { Interruptor } from "@/components/ui/Interruptor";
import { Modal } from "@/components/ui/Modal";
import { SelectorImagen } from "@/components/ui/SelectorImagen";
import { api, datos, erroresPorCampo, formulario } from "@/lib/api/client";
import type { CategoriaCarta, DatosProducto, ProductoCarta } from "@/lib/api/tipos";
import { importeEditable, leerImporte } from "@/lib/formato";
import { FotoProducto } from "./VistaCarta";

type Errores = Partial<Record<"nombre" | "precio" | "categoriaId" | "descripcion" | "foto", string>>;


/** Alta y edición de un producto con su foto (RF-17). */
export function FormularioProducto({ abierto, producto, categorias, categoriaInicial, onCerrar, onGuardado }: {
  abierto: boolean;
  producto?: ProductoCarta;
  categorias: CategoriaCarta[];
  categoriaInicial?: number;
  onCerrar: () => void;
  onGuardado: (producto: ProductoCarta) => void;
}) {
  return (
    <Modal titulo={producto ? "Editar producto" : "Nuevo producto"} abierto={abierto} onCerrar={onCerrar}>
      {abierto && <Contenido key={producto?.id ?? "nuevo"} producto={producto} categorias={categorias} categoriaInicial={categoriaInicial} onCerrar={onCerrar} onGuardado={onGuardado} />}
    </Modal>
  );
}

function Contenido({ producto, categorias, categoriaInicial, onCerrar, onGuardado }: Omit<Parameters<typeof FormularioProducto>[0], "abierto">) {
  const [disponible, setDisponible] = useState(producto?.disponible ?? true);
  const [foto, setFoto] = useState<{ archivo?: File; quitar: boolean }>({ quitar: false });
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const f = new FormData(evento.currentTarget);
    const texto = (campo: string) => String(f.get(campo) ?? "").trim();
    const datosProducto: DatosProducto = {
      categoriaId: Number(f.get("categoriaId")),
      nombre: texto("nombre"),
      descripcion: texto("descripcion") || null,
      precio: leerImporte(texto("precio")),
      disponible,
      quitarFoto: foto.quitar,
    };
    const nuevos: Errores = {};
    if (!datosProducto.nombre) nuevos.nombre = "Escribe el nombre del producto";
    if (Number.isNaN(datosProducto.precio) || datosProducto.precio > 999.99) nuevos.precio = "Escribe un precio como 6,50";
    if (!datosProducto.categoriaId) nuevos.categoriaId = "Elige la categoría";
    setErrores(nuevos);
    setErrorGeneral(undefined);
    if (Object.keys(nuevos).length) return;

    setEnviando(true);
    // openapi-typescript tipa los ficheros (format: binary) como string; viajan como Blob.
    const body = { datos: datosProducto, foto: foto.archivo as unknown as string };
    try {
      onGuardado(
        producto
          ? await datos(api.PUT("/negocio/productos/{id}", { params: { path: { id: producto.id } }, body, bodySerializer: formulario }))
          : await datos(api.POST("/negocio/productos", { body, bodySerializer: formulario })),
      );
    } catch (e) {
      const porCampo = erroresPorCampo(e);
      if (porCampo) setErrores(porCampo);
      else setErrorGeneral((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <SelectorImagen
        actual={producto?.fotoUrl}
        texto={producto?.fotoUrl ? "Cambiar foto" : "Añadir foto"}
        permitirQuitar
        onCambio={setFoto}
        error={errores.foto}
        vista={(url) => <FotoProducto producto={{ fotoUrl: url ?? null, nombre: producto?.nombre ?? "" }} tamano={72} />}
      />
      <div className="flex flex-col gap-4 sm:flex-row">
        <CampoTexto etiqueta="Nombre" name="nombre" defaultValue={producto?.nombre} placeholder="Hamburguesa clásica" maxLength={100} error={errores.nombre} autoFocus />
        <CampoTexto
          etiqueta="Precio (€)"
          name="precio"
          inputMode="decimal"
          defaultValue={producto ? importeEditable(producto.precio) : ""}
          placeholder="6,50"
          error={errores.precio}
          className="sm:max-w-[160px]"
        />
      </div>
      <CampoTexto etiqueta="Descripción (opcional)" name="descripcion" defaultValue={producto?.descripcion ?? ""} placeholder="Ternera, queso, lechuga y tomate" maxLength={300} error={errores.descripcion} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <CampoSelect etiqueta="Categoría" name="categoriaId" defaultValue={producto?.categoriaId ?? categoriaInicial ?? ""} error={errores.categoriaId}>
          <option value="" disabled>Elige una categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </CampoSelect>
        <div className="flex h-[52px] flex-1 items-center gap-2">
          <Interruptor activado={disponible} onChange={setDisponible} etiqueta="Disponible" />
          <span className={`texto-normal ${disponible ? "" : "text-estado-error"}`}>{disponible ? "Disponible" : "Agotado"}</span>
        </div>
      </div>

      {errorGeneral && <p role="alert" className="texto-pequeno text-estado-error">{errorGeneral}</p>}

      <div className="flex justify-end gap-3">
        <Boton tipo="fantasma" onClick={onCerrar}>Cancelar</Boton>
        <Boton type="submit" disabled={enviando}>{enviando ? "Guardando…" : producto ? "Guardar cambios" : "Añadir a la carta"}</Boton>
      </div>
    </form>
  );
}
