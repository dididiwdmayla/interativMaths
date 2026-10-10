import type { Metadata } from "next";
import { Mapa } from "@/componentes/mundo/Mapa";

export const metadata: Metadata = { title: "Mapa do Engenho" };

export default function PaginaMapa() {
  return <Mapa />;
}
