import Link from "next/link";
import { FichaEstado } from "@/componentes/ui/FichaEstado";

export default function NaoEncontrado() {
  return (
    <FichaEstado tela="nao-encontrado" expressao="duvida" titulo="Esta página não existe">
      <p className="m-0 text-[16px] font-medium text-tinta-suave">Nenhuma folha do caderno leva até aqui.</p>
      <Link href="/mapa" className="botao-principal w-full">
        Ir para o mapa
      </Link>
    </FichaEstado>
  );
}
