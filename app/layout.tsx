import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AnimatedBackground from "@/components/AnimatedBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Âncora | Sua Mente em Solo Firme",
  description: "Ecossistema de saúde mental e acolhimento.",
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
      <body className={`${inter.className} antialiased overflow-x-hidden bg-transparent`}>
        {/* O fundo é o primeiro elemento e fica atrás de tudo */}
        <AnimatedBackground />
        
        <div className="relative flex min-h-screen">
          <Sidebar />
          <main className="flex-1 lg:ml-64 relative z-10 bg-transparent">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
