import type { Metadata } from "next";
import { Suspense } from "react";
import { Abertura } from "@/componentes/mundo/Abertura";
import { Carregando } from "@/componentes/ui/Carregando";

export const metadata: Metadata = { title: "Abertura" };

export default function PaginaAbertura() {
  return (
    <Suspense fallback={<Carregando />}>
      <Abertura />
    </Suspense>
  );
}
