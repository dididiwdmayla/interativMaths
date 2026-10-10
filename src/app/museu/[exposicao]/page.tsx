import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ATIVIDADES } from "@/conteudo/atividades";
import { atividadePorSlug, slugDe } from "@/componentes/estado/catalogo";
import { Executor } from "@/componentes/missao/Executor";
import { Carregando } from "@/componentes/ui/Carregando";

export function generateStaticParams() {
  return ATIVIDADES.filter((a) => a.tipo === "exposicao").map((a) => ({ exposicao: slugDe(a) }));
}

function Exposicao({ slug }: { slug: string }) {
  const a = atividadePorSlug(slug, ["exposicao"]);
  if (!a) notFound();
  return <Executor atividadeId={a.id} voltar={{ href: "/mapa", rotulo: "Mapa" }} />;
}

export default function PaginaExposicao({ params }: PageProps<"/museu/[exposicao]">) {
  return <Suspense fallback={<Carregando />}>{params.then(({ exposicao }) => <Exposicao slug={exposicao} />)}</Suspense>;
}
