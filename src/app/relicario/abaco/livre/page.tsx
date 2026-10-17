import type { Metadata } from "next";
import { SorobanLivre } from "@/componentes/joias/SorobanLivre";

export const metadata: Metadata = { title: "Soroban livre" };

export default function PaginaSorobanLivre() {
  return <SorobanLivre />;
}
