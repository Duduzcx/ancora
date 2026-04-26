"use client";

import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPorto = pathname?.startsWith("/porto") || pathname === "/porto";

  return (
    <main className={`${isPorto ? "" : "lg:ml-64"} relative z-10 bg-transparent min-h-screen`}>
      {children}
    </main>
  );
}
