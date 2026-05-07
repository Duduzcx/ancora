import type { Metadata } from "next";
import { Inter, Pacifico } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import NavigationDock from "@/components/NavigationDock";

const inter = Inter({ subsets: ["latin"] });
const pacifico = Pacifico({ weight: '400', subsets: ['latin'], variable: '--font-pacifico' });

export const metadata: Metadata = {
  title: "Nórica: Mental Navigation",
  description: "Seu sistema de navegação e suporte emocional.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased bg-slate-50 overscroll-none`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <NavigationDock />
      </body>
    </html>
  );
}
