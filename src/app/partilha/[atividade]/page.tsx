import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ATIVIDADES } from "@/conteudo/atividades";
import { atividadePorSlug, slugDe } from "@/componentes/estado/catalogo";
import { Executor } from "@/componentes/missao/Executor";
import { Carregando } from "@/componentes/ui/Carregando";

export function generateStaticParams() {
  return ATIVIDADES.filter((a) => a.distrito === "partilha" && (a.tipo === "missao" || a.tipo === "eco" || a.tipo === "revisita")).map((a) => ({
    atividade: slugDe(a),
  }));
}

function Atividade({ slug }: { slug: string }) {
  const a = atividadePorSlug(slug, ["missao", "eco", "revisita"]);
  if (!a) notFound();
  return <Executor atividadeId={a.id} voltar={{ href: "/partilha", rotulo: "Partilha" }} />;
}

export default function PaginaAtividade({ params }: PageProps<"/partilha/[atividade]">) {
  return <Suspense fallback={<Carregando />}>{params.then(({ atividade }) => <Atividade slug={atividade} />)}</Suspense>;
}
