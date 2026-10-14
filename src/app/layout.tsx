import type { Metadata, Viewport } from "next";
import { AplicarPreferencias } from "@/componentes/estado/Preferencias";
import { AvisoProgresso } from "@/componentes/estado/AvisoProgresso";
import { fonteInterface, fonteMao } from "./fontes";
import { DESCRICAO, ENDERECO_OFICIAL, NOME } from "./metadados";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(ENDERECO_OFICIAL),
  title: {
    default: "interativMaths — o Engenho",
    template: "%s · interativMaths",
  },
  description: DESCRICAO,
  applicationName: NOME,
  openGraph: { type: "website", locale: "pt_BR", siteName: NOME, title: "interativMaths — o Engenho", description: DESCRICAO },
  twitter: { card: "summary_large_image" },
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
