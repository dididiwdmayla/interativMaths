import type { Metadata } from "next";
import { Relicario } from "@/componentes/joias/Relicario";

export const metadata: Metadata = { title: "Relicário" };

export default function PaginaRelicario() {
  return <Relicario />;
}
