import type { Metadata } from "next";
import { Menu } from "@/componentes/mundo/Menu";

export const metadata: Metadata = { title: "Menu" };

export default function PaginaMenu() {
  return <Menu />;
}
