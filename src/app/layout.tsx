import type { Metadata, Viewport } from "next";
import { AplicarPreferencias } from "@/componentes/estado/Preferencias";
import { AvisoProgresso } from "@/componentes/estado/AvisoProgresso";
import { fonteInterface, fonteMao } from "./fontes";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "interativMaths — o Engenho",
    template: "%s · interativMaths",
  },
  description:
    "Uma aventura de matemática: faça o Engenho voltar a funcionar descobrindo por que ele funciona.",
  applicationName: "interativMaths",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fonteInterface.variable} ${fonteMao.variable}`}
    >
      <body>
        <AplicarPreferencias />
        <AvisoProgresso />
        {children}
      </body>
    </html>
  );
}
