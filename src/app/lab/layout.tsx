import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laboratório",
  robots: { index: false, follow: false },
};

export default function LayoutLab({ children }: LayoutProps<"/lab">) {
  return children;
}
