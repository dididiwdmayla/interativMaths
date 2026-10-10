import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ATIVIDADES } from "@/conteudo/atividades";
import { atividadePorSlug, slugDe } from "@/componentes/estado/catalogo";
import { Executor } from "@/componentes/missao/Executor";
import { Carregando } from "@/componentes/ui/Carregando";

export function generateStaticParams() {
  return ATIVIDADES.filter((a) => a.tipo === "cena").map((a) => ({ cena: slugDe(a) }));
}

function Cena({ slug }: { slug: string }) {
  const a = atividadePorSlug(slug, ["cena"]);
  if (!a) notFound();
  return <Executor atividadeId={a.id} voltar={{ href: "/mapa", rotulo: "Mapa" }} />;
}

export default function PaginaCena({ params }: PageProps<"/rua/[cena]">) {
  return <Suspense fallback={<Carregando />}>{params.then(({ cena }) => <Cena slug={cena} />)}</Suspense>;
}
