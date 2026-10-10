import type { Metadata } from "next";
import { Caderno } from "@/componentes/caderno/Caderno";

export const metadata: Metadata = { title: "Caderno" };

export default function PaginaCaderno() {
  return <Caderno />;
}
