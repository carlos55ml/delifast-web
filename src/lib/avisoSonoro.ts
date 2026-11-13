"use client";

let contexto: AudioContext | undefined;

/**
 * Aviso sonoro de pedido nuevo (RF-14): dos tonos cortos con Web Audio, sin ficheros.
 * El navegador solo deja sonar tras alguna interacción con la página; si aún no la ha
 * habido, el aviso se queda en el visual.
 */
export function sonarAvisoPedido() {
  try {
    contexto ??= new AudioContext();
    if (contexto.state === "suspended") void contexto.resume();
    const inicio = contexto.currentTime;
    [880, 1175].forEach((frecuencia, i) => {
      const oscilador = contexto!.createOscillator();
      const volumen = contexto!.createGain();
      oscilador.type = "sine";
      oscilador.frequency.value = frecuencia;
      const t = inicio + i * 0.18;
      volumen.gain.setValueAtTime(0.0001, t);
      volumen.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      volumen.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      oscilador.connect(volumen).connect(contexto!.destination);
      oscilador.start(t);
      oscilador.stop(t + 0.17);
    });
  } catch {
    // Sin Web Audio: solo aviso visual.
  }
}
