import type { Metadata } from "next";
import { Suspense } from "react";
import { Sondagem } from "@/componentes/missao/Chamados";
import { Carregando } from "@/componentes/ui/Carregando";

export const metadata: Metadata = { title: "Uma medida rápida" };

export default function PaginaSondagem() {
  return (
    <Suspense fallback={<Carregando />}>
      <Sondagem />
    </Suspense>
  );
}
