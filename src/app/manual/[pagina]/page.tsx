import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PAGINAS_MANUAL } from "@/conteudo/manual";
import { paginaPorSlug } from "@/componentes/manual/dados";
import { TelaPaginaManual } from "@/componentes/manual/PaginaManual";
import { Carregando } from "@/componentes/ui/Carregando";

export const metadata: Metadata = { title: "Manual" };

export function generateStaticParams() {
  return PAGINAS_MANUAL.map((p) => ({ pagina: p.slug }));
}

function Pagina({ slug }: { slug: string }) {
  if (!paginaPorSlug(slug)) notFound();
  return <TelaPaginaManual slug={slug} />;
}

export default function RotaPaginaManual({ params }: PageProps<"/manual/[pagina]">) {
  return <Suspense fallback={<Carregando />}>{params.then(({ pagina }) => <Pagina slug={pagina} />)}</Suspense>;
}
