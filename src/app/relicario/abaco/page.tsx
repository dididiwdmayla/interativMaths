import type { Metadata } from "next";
import { Lapidacao } from "@/componentes/joias/Lapidacao";

export const metadata: Metadata = { title: "Lapidação" };

export default function PaginaLapidacao() {
  return <Lapidacao />;
}
