"use client";

import { motion } from "framer-motion";

/**
 * Animação de transição de página minimalista.
 * Resolve a solicitação de "animação bem leve e minimalista ao mudar paginas".
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
