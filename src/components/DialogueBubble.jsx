import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function DialogueBubble({ text, delay = 170 }) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    let index = 0;
    let intervalId;

    setVisibleText("");

    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1;
        setVisibleText(text.slice(0, index));

        if (index >= text.length) {
          window.clearInterval(intervalId);
        }
      }, 18);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [text, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute bottom-5 left-1/2 z-20 w-[min(92vw,760px)] -translate-x-1/2"
    >
      <div className="relative rounded-2xl border border-white/25 bg-black/55 px-4 py-3 text-center shadow-xl backdrop-blur-md sm:px-5 sm:py-3.5">
        <p className="text-xs font-extrabold leading-relaxed text-ink sm:text-sm">{visibleText}</p>
        <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-white/25 bg-black/55" />
      </div>
    </motion.div>
  );
}