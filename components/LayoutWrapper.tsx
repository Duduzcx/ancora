"use client";

import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullPage = pathname?.startsWith("/porto") || 
                     pathname?.startsWith("/arena") || 
                     pathname?.startsWith("/cofre") ||
                     pathname === "/auth";

  return (
    <main className={`${isFullPage ? "" : "lg:ml-64"} relative z-10 bg-transparent min-h-screen`}>
      {children}
    </main>
  );
}
