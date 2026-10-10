/**
 * Enquanto o progresso não foi lido (primeira pintura): o Nônio medindo, sem texto que pisque.
 */
import { Nonio } from "@/componentes/nonio/Nonio";

export function Carregando() {
  return (
    <main data-pronto="nao" className="flex min-h-dvh items-center justify-center" aria-busy="true">
      <Nonio expressao="medindo" tamanho={72} rotulo="Carregando" />
    </main>
  );
}
