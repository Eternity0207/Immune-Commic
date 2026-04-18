import { memo, useEffect, useRef } from "react";
import { motion, useInView, useMotionTemplate, useScroll, useTransform } from "framer-motion";

function handleImageError(event, fallbackImage) {
  if (!fallbackImage || event.currentTarget.dataset.fallbackApplied === "true") {
    return;
  }

  event.currentTarget.dataset.fallbackApplied = "true";
  event.currentTarget.src = fallbackImage;
}

const Scene = memo(function Scene({
  panelIndex,
  image,
  fallbackImage,
  caption,
  labels,
  infoHint,
  onPanelFocus,
  onOpenInfo,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.6 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    if (!isInView || !onPanelFocus) {
      return;
    }

    onPanelFocus(
      infoHint
        ? {
            panelIndex,
            infoId: infoHint.id,
            infoText: infoHint.text,
          }
        : null
    );
  }, [infoHint, isInView, onPanelFocus, panelIndex]);

  const backgroundY = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const mainY = useTransform(scrollYProgress, [0, 1], [36, -30]);
  const textY = useTransform(scrollYProgress, [0, 1], [52, -56]);

  const focusAmount = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const backgroundOpacity = useTransform(focusAmount, [0, 1], [0.26, 0.46]);
  const backgroundBlur = useTransform(focusAmount, [0, 1], [20, 12]);
  const mainOpacity = useTransform(focusAmount, [0, 1], [0.82, 1]);
  const mainBrightness = useTransform(focusAmount, [0, 1], [0.84, 1.08]);
  const mainContrast = useTransform(focusAmount, [0, 1], [0.92, 1.04]);
  const mainBlur = useTransform(focusAmount, [0, 1], [1.2, 0.08]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.82, 1], [0, 0.88, 1, 0.9, 0.58]);

  const backgroundFilter = useMotionTemplate`blur(${backgroundBlur}px)`;
  const mainFilter = useMotionTemplate`brightness(${mainBrightness}) contrast(${mainContrast}) blur(${mainBlur}px)`;

  return (
    <section ref={ref} className="relative flex h-[120vh] w-full items-center justify-center overflow-hidden">
      <motion.img
        src={image}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover"
        style={{ y: backgroundY, opacity: backgroundOpacity, filter: backgroundFilter }}
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={(event) => handleImageError(event, fallbackImage)}
      />

      <motion.img
        src={image}
        alt="Comic story panel"
        className="relative z-10 w-[min(90%,1300px)] object-contain drop-shadow-[0_20px_80px_rgba(0,0,0,0.65)]"
        style={{ y: mainY, opacity: mainOpacity, filter: mainFilter }}
        initial={{ opacity: 0, scale: 1.08 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.58, ease: "easeOut" }}
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={(event) => handleImageError(event, fallbackImage)}
      />

      <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(1,6,18,0.78)_0%,rgba(1,6,18,0.06)_30%,rgba(1,6,18,0.06)_70%,rgba(1,6,18,0.82)_100%)]" />

      {caption ? (
        <motion.p
          className="absolute bottom-10 z-30 max-w-[88%] px-2 text-center text-lg leading-relaxed tracking-[0.01em] text-white md:bottom-14 md:text-xl md:leading-[1.65] [text-shadow:0_8px_28px_rgba(0,0,0,0.95)]"
          style={{ y: textY, opacity: textOpacity, textWrap: "balance", whiteSpace: "pre-line" }}
        >
          {caption}
        </motion.p>
      ) : null}

      {labels?.map((label, labelIndex) => (
        <button
          key={`${label.id}-${labelIndex}`}
          type="button"
          className="info-label absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-cyan-100 backdrop-blur-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
          style={{ top: label.top, left: label.left }}
          onClick={(event) => {
            event.stopPropagation();
            onOpenInfo(label.id, event);
          }}
          aria-label={`Open info about ${label.id.replace(/_/g, " ")}`}
        >
          {label.text}
        </button>
      ))}
    </section>
  );
});

export default Scene;
