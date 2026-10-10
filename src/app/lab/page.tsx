import Link from "next/link";

const PAGINAS = [
  { href: "/lab/maquinas", titulo: "Máquinas", linha: "A bancada solta, com qualquer configuração e pele, e os validadores." },
  { href: "/lab/progresso", titulo: "Progresso", linha: "Zerar, saltar para pontos do arco, adiantar o relógio, ver evidências e estados." },
  { href: "/lab/vitrine", titulo: "Vitrine", linha: "Tokens, kit de peças, expressões do Nônio, estágios das joias, notação." },
];

export default function PaginaLab() {
  return (
    <main data-pronto="sim" data-tela="lab" className="area-segura area-segura-topo mx-auto flex max-w-xl flex-col gap-4 pb-16 pt-6">
      <p className="rotulo-chapa m-0">Fora da navegação do jogo</p>
      <h1 className="fonte-sinal m-0 text-[2.4rem] font-extrabold uppercase leading-none">Laboratório</h1>
      <ul className="m-0 flex flex-col gap-3 p-0">
        {PAGINAS.map((p) => (
          <li key={p.href} className="list-none">
            <Link href={p.href} className="chapa block p-4">
              <span className="fonte-sinal block text-[1.5rem] font-bold uppercase text-turquesa-clara">{p.titulo}</span>
              <span className="block text-texto-mundo-suave">{p.linha}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/" className="placa placa-discreta self-start">
        Voltar ao jogo
      </Link>
    </main>
  );
}
