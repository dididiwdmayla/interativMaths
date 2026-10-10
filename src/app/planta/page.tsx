import type { Metadata } from "next";
import { Planta } from "@/componentes/mundo/Planta";

export const metadata: Metadata = { title: "A Planta" };

export default function PaginaPlanta() {
  return <Planta />;
}
