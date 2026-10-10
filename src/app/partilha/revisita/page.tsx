import type { Metadata } from "next";
import { Revisita } from "@/componentes/missao/Chamados";

export const metadata: Metadata = { title: "Revisita" };

export default function PaginaRevisita() {
  return <Revisita />;
}
