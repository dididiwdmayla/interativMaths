import Link from "next/link";
import { Nonio } from "@/componentes/nonio/Nonio";

export default function NaoEncontrado() {
  return (
    <main data-pronto="sim" data-tela="nao-encontrado" className="area-segura flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
      <Nonio expressao="duvida" tamanho={84} />
      <h1 className="fonte-sinal m-0 text-[2rem] font-extrabold uppercase text-latao-claro">Esta sala não existe</h1>
      <p className="m-0 max-w-sm text-texto-mundo-suave">Nenhum corredor do Engenho leva até aqui.</p>
      <Link href="/mapa" className="placa placa-cheia">
        Ir para o mapa
      </Link>
    </main>
  );
}
