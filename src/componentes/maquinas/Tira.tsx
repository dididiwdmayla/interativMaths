/**
 * A mensagem da máquina: uma tira de papel com borda de tinta, logo abaixo dela, anunciada ao
 * leitor de tela. Em sobra e engasgo, um ponto vermelho ao lado; o texto continua em tinta.
 */
import type { TomTira } from "./mensagens";

export function TiraMensagem({ texto, tom = "normal", idTeste }: { texto: string | null; tom?: TomTira; idTeste?: string }) {
  return (
    <p className="tira m-0" data-tom={tom} role="status" aria-live="polite" data-visor={idTeste ?? ""}>
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" className="shrink-0">
        {tom === "atencao" ? (
          <circle cx="6" cy="6" r="5" fill="var(--vermelho)" />
        ) : tom === "feito" ? (
          <circle cx="6" cy="6" r="4.6" fill="var(--marca-texto)" stroke="var(--contorno)" strokeWidth="1.8" />
        ) : (
          <circle cx="6" cy="6" r="4.4" fill="none" stroke="var(--tinta-suave)" strokeWidth="1.8" />
        )}
      </svg>
      <span className="min-w-0">{tom === "feito" && texto ? <span className="grifo">{texto}</span> : (texto ?? "Máquina pronta.")}</span>
    </p>
  );
}
