/**
 * Navegação do jogo, como chapa de instrumento no rodapé (zona do polegar).
 */
import Link from "next/link";
import { IconeCaderno } from "@/componentes/icones/IconeCaderno";
import { IconeMapa } from "@/componentes/icones/IconeMapa";
import { IconeMenu } from "@/componentes/icones/IconeMenu";
import { IconePlanta } from "@/componentes/icones/IconePlanta";
import { IconeRelicario } from "@/componentes/icones/IconeRelicario";

export type Destino = "mapa" | "caderno" | "planta" | "relicario" | "menu";

const ITENS: { id: Destino; href: string; rotulo: string; Icone: () => React.ReactElement }[] = [
  { id: "mapa", href: "/mapa", rotulo: "Mapa", Icone: IconeMapa },
  { id: "caderno", href: "/caderno", rotulo: "Caderno", Icone: IconeCaderno },
  { id: "planta", href: "/planta", rotulo: "Planta", Icone: IconePlanta },
  { id: "relicario", href: "/relicario", rotulo: "Relicário", Icone: IconeRelicario },
  { id: "menu", href: "/menu", rotulo: "Menu", Icone: IconeMenu },
];

export function NavJogo({ atual }: { atual?: Destino }) {
  return (
    <nav aria-label="Navegação do jogo" className="fixed inset-x-0 bottom-0 z-30 area-segura-base">
      <ul className="chapa mx-2 mb-2 flex justify-around px-1 py-1.5">
        {ITENS.map(({ id, href, rotulo, Icone }) => {
          const ativo = id === atual;
          return (
            <li key={id} className="list-none">
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={`flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-lg px-1 ${ativo ? "text-ambar" : "text-turquesa-clara"}`}
                data-nav={id}
              >
                <Icone />
                <span className="fonte-sinal text-[0.8rem] font-bold uppercase tracking-wide">{rotulo}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
