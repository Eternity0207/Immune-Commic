import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { KNOWLEDGE_BASE } from "../lib/knowledgeBase";
import InfoOverlay from "./InfoOverlay";
import Panel from "./Panel";
import TooltipSystem from "./TooltipSystem";

const PANELS = [
  {
    id: "p1",
    image: "/assets/panels/p1.jpeg",
    caption: "Recognition begins with form.",
    hotspots: [
      { id: "t1", key: "t_cell", label: "Arjun", x: 32, y: 54 },
      { id: "a1", key: "antigen", label: "Antigen", x: 63, y: 42 },
      { id: "s1", key: "self_marker", label: "Self Marker", x: 49, y: 70 },
    ],
  },
  {
    id: "p2",
    image: "/assets/panels/p2.jpeg",
    caption: "Self and non-self are read like patterns.",
    hotspots: [
      { id: "n1", key: "non_self_pattern", label: "Non-Self Pattern", x: 58, y: 38 },
      { id: "m1", key: "macrophage", label: "T-Helper Cell", x: 34, y: 58 },
    ],
  },
  {
    id: "p10",
    image: "/assets/panels/p10.jpeg",
    caption: "Defense shifts from detection to response.",
    hotspots: [
      { id: "h1", key: "helper_t_cell", label: "Helper T Cell", x: 43, y: 49 },
      { id: "b1", key: "b_cell", label: "Dr. Immuno", x: 67, y: 58 },
      { id: "ab1", key: "antibody", label: "Neutrophil", x: 74, y: 40 },
    ],
  },
  {
    id: "p14",
    image: "/assets/panels/p14.jpeg",
    caption: "Precise targeting protects healthy tissue.",
    hotspots: [
      { id: "c1", key: "cytotoxic_t_cell", label: "Cytotoxic T Cell", x: 37, y: 52 },
      { id: "n2", key: "non_self_pattern", label: "Threat Pattern", x: 62, y: 48 },
    ],
  },
  {
    id: "p40",
    image: "/assets/panels/p40.jpeg",
    caption: "Memory keeps the next response faster.",
    hotspots: [
      { id: "m2", key: "memory_cell", label: "CD8 + Cypotoxic T-Cell", x: 52, y: 46 },
      { id: "ab2", key: "antibody", label: "Neutrophil", x: 68, y: 57 },
    ],
  },
];

export default function ComicViewer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [activeInfo, setActiveInfo] = useState(null);
  const [activeAnchor, setActiveAnchor] = useState({ x: 50, y: 50 });
  const [ripple, setRipple] = useState(null);
  const lockRef = useRef(false);

  const currentPanel = useMemo(() => PANELS[currentIndex], [currentIndex]);

  const goNext = () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setCurrentIndex((idx) => (idx + 1) % PANELS.length);
    window.setTimeout(() => {
      lockRef.current = false;
    }, 420);
  };

  const handlePanelWheel = (event) => {
    if (Math.abs(event.deltaY) < 12) return;
    goNext();
  };

  const handlePanelClick = () => {
    goNext();
  };

  const handleHotspotClick = (hotspot) => {
    const info = KNOWLEDGE_BASE[hotspot.key];
    if (!info) return;

    setActiveInfo(info);
    setActiveAnchor({ x: hotspot.x, y: hotspot.y });
    setRipple({ id: hotspot.id + Date.now(), x: hotspot.x, y: hotspot.y });

    window.setTimeout(() => setRipple(null), 360);
  };

  return (
    <section
      className="relative h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#11253f_0%,#050d1b_45%,#01060f_100%)]"
      onWheel={handlePanelWheel}
    >
      <AnimatePresence mode="wait">
        <Panel
          key={currentPanel.id}
          panel={currentPanel}
          onPanelClick={handlePanelClick}
          onHotspotClick={handleHotspotClick}
          onHotspotHover={setHoveredHotspot}
        />
      </AnimatePresence>

      <TooltipSystem hotspot={hoveredHotspot} />

      {ripple ? (
        <motion.span
          key={ripple.id}
          initial={{ opacity: 0.55, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2.5 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="pointer-events-none absolute z-20 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/60"
          style={{ left: `${ripple.x}%`, top: `${ripple.y}%` }}
        />
      ) : null}

      <InfoOverlay info={activeInfo} anchor={activeAnchor} onClose={() => setActiveInfo(null)} />

      <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-200 backdrop-blur-sm">
        Panel {currentIndex + 1} / {PANELS.length}
      </div>
    </section>
  );
}
