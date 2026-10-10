import Link from "next/link";
import { CabecalhoLugar } from "@/componentes/ui/Cabecalho";

const PAGINAS = [
  { href: "/lab/vitrine", titulo: "Vitrine", linha: "A identidade inteira: tokens, letra, receitas, kit de desenho, Nônio, joias, notação." },
  { href: "/lab/maquinas", titulo: "Máquinas", linha: "A bancada solta, com qualquer configuração e pele, e os validadores." },
  { href: "/lab/progresso", titulo: "Progresso", linha: "Zerar, saltar para pontos do arco, adiantar o relógio, ver evidências e estados." },
];

export default function PaginaLab() {
  return (
    <main data-pronto="sim" data-tela="lab" className="min-h-dvh pb-16">
      <CabecalhoLugar voltar={{ href: "/", rotulo: "o jogo" }} lugar="Fora da navegação do jogo" titulo="Laboratório" />
      <ul className="area-segura mx-auto m-0 flex w-full max-w-[640px] flex-col gap-4 pt-5">
        {PAGINAS.map((p) => (
          <li key={p.href} className="list-none">
            <Link href={p.href} className="ficha block p-4">
              <span className="block text-[18px] font-extrabold text-caneta">{p.titulo}</span>
              <span className="mt-0.5 block text-[15px] font-medium text-tinta-suave">{p.linha}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
