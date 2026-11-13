"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Icono } from "@/components/ui/Icono";
import { Modal } from "@/components/ui/Modal";
import { ErrorApi, api, datos } from "@/lib/api/client";
import type { FranjaHorario, MiNegocio } from "@/lib/api/tipos";

export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/** "12:30–16:00 · 20:00–23:30" */
export function textoFranjas(franjas: FranjaHorario[]): string {
  return [...franjas].sort((a, b) => a.apertura.localeCompare(b.apertura)).map((f) => `${f.apertura}–${f.cierre}`).join(" · ");
}

const MAX_FRANJAS_DIA = 3;
const entrada = "h-10 w-[84px] text-center rounded-[10px] border border-neutro-borde bg-white px-2 texto-normal outline-none focus:border-2 focus:border-marca-rojo focus:px-[7px] aria-invalid:border-estado-error";
/** Siempre 24 h (un input type="time" sale en 12 h según el idioma del sistema). */
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Editor del horario semanal (botón "Editar horario" de N07). Cada día admite hasta 3 franjas. */
export function ModalHorario({ abierto, horarios, onCerrar, onGuardado }: {
  abierto: boolean;
  horarios: FranjaHorario[];
  onCerrar: () => void;
  onGuardado: (negocio: MiNegocio) => void;
}) {
  return (
    <Modal titulo="Horario de apertura" abierto={abierto} onCerrar={onCerrar}>
      {abierto && <Contenido horarios={horarios} onCerrar={onCerrar} onGuardado={onGuardado} />}
    </Modal>
  );
}

function Contenido({ horarios, onCerrar, onGuardado }: Omit<Parameters<typeof ModalHorario>[0], "abierto">) {
  const [franjas, setFranjas] = useState<FranjaHorario[]>(() => horarios.map((f) => ({ ...f })));
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (indice: number, campo: "apertura" | "cierre", valor: string) =>
    setFranjas((l) => l.map((f, i) => (i === indice ? { ...f, [campo]: valor } : f)));

  async function guardar() {
    const propios = franjas
      .filter((f) => !HORA.test(f.apertura) || !HORA.test(f.cierre) || f.apertura === f.cierre)
      .map((f) => `${DIAS[f.dia - 1]}: escribe las horas como 12:30, y que la apertura y el cierre sean distintos.`);
    setErrores(propios);
    if (propios.length) return;
    setEnviando(true);
    try {
      onGuardado(await datos(api.PUT("/negocio/horarios", { body: franjas })));
    } catch (e) {
      setErrores(e instanceof ErrorApi && e.problema?.errores ? e.problema.errores : [(e as Error).message]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <p className="texto-pequeno text-neutro-texto-secundario">
        Un día sin franjas queda cerrado. Si el cierre es anterior a la apertura (20:00–00:30), la franja pasa de medianoche.
      </p>
      <div className="flex flex-col">
        {DIAS.map((nombre, i) => {
          const dia = i + 1;
          const delDia = franjas.map((f, indice) => ({ f, indice })).filter(({ f }) => f.dia === dia);
          return (
            <fieldset key={dia} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-neutro-borde py-2.5">
              <legend className="float-left w-24 texto-destacado">{nombre}</legend>
              <div className="flex flex-1 flex-col gap-2">
                {delDia.length === 0 && <span className="texto-normal text-neutro-texto-secundario">Cerrado</span>}
                {delDia.map(({ f, indice }, n) => (
                  <div key={indice} className="flex items-center gap-2">
                    <input type="text" inputMode="numeric" maxLength={5} placeholder="00:00" aria-label={`${nombre}, franja ${n + 1}, apertura`} aria-invalid={!HORA.test(f.apertura) || undefined} value={f.apertura} onChange={(e) => cambiar(indice, "apertura", e.target.value)} className={entrada} />
                    <span aria-hidden>–</span>
                    <input type="text" inputMode="numeric" maxLength={5} placeholder="00:00" aria-label={`${nombre}, franja ${n + 1}, cierre`} aria-invalid={!HORA.test(f.cierre) || undefined} value={f.cierre} onChange={(e) => cambiar(indice, "cierre", e.target.value)} className={entrada} />
                    <button
                      type="button"
                      aria-label={`Quitar la franja ${n + 1} del ${nombre.toLowerCase()}`}
                      onClick={() => setFranjas((l) => l.filter((_, j) => j !== indice))}
                      className="cursor-pointer rounded-md p-1 hover:bg-neutro-fondo focus-visible:outline-2 focus-visible:outline-marca-rojo"
                    >
                      <Icono nombre="papelera" className="size-5" />
                    </button>
                  </div>
                ))}
              </div>
              {delDia.length < MAX_FRANJAS_DIA && (
                <button
                  type="button"
                  onClick={() => setFranjas((l) => [...l, { dia, apertura: delDia.length ? "20:00" : "12:30", cierre: delDia.length ? "23:30" : "16:00" }])}
                  className="cursor-pointer rounded-md texto-pequeno font-semibold text-marca-rojo hover:underline focus-visible:outline-2 focus-visible:outline-marca-rojo"
                >
                  + Franja
                </button>
              )}
            </fieldset>
          );
        })}
      </div>
      {errores.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 texto-pequeno text-estado-error">
          {errores.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
      <div className="flex justify-end gap-3">
        <Boton tipo="fantasma" onClick={onCerrar}>Cancelar</Boton>
        <Boton onClick={guardar} disabled={enviando}>{enviando ? "Guardando…" : "Guardar horario"}</Boton>
      </div>
    </>
  );
}
