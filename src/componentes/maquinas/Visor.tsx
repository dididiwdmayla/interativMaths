/**
 * Visor da máquina: uma linha de estado, anunciada ao leitor de tela.
 */
import type { TomVisor } from "./mensagens";

export function Visor({ texto, tom = "normal", idTeste }: { texto: string | null; tom?: TomVisor; idTeste?: string }) {
  return (
    <p className="visor" data-tom={tom} role="status" aria-live="polite" data-visor={idTeste ?? ""}>
      <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" className="shrink-0">
        <circle cx="5" cy="5" r="4" fill={tom === "atencao" ? "var(--vermelhao)" : tom === "ambar" ? "var(--ambar)" : "var(--ambar-sombra)"} />
      </svg>
      <span>{texto ?? "Máquina pronta."}</span>
    </p>
  );
}
