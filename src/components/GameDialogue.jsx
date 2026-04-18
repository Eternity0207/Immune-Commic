import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function GameDialogue({ speaker, text }) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let cursor = 0;
    setTyped("");

    const delay = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        cursor += 1;
        setTyped(text.slice(0, cursor));

        if (cursor >= text.length) {
          window.clearInterval(interval);
        }
      }, 18);
    }, 140);

    return () => {
      window.clearTimeout(delay);
    };
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 150, damping: 18 }}
      className="absolute bottom-6 left-1/2 z-30 w-[min(92vw,760px)] -translate-x-1/2"
    >
      <div className="rounded-2xl border border-cyan-100/25 bg-[#04101f]/82 px-4 py-3 shadow-[0_0_30px_rgba(45,212,191,0.16)] backdrop-blur-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-200">{speaker}</p>
        <p className="mt-1 text-sm font-bold text-slate-100 sm:text-base">{typed}</p>
      </div>
    </motion.div>
  );
}
