import { motion } from "framer-motion";
import Panel from "./Panel";

export default function Story({ panel, currentPanel, totalPanels, isPanelTransitioning, onNext }) {
  return (
    <motion.section
      key="story"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
      className="h-screen w-screen"
    >
      <Panel
        panel={panel}
        currentPanel={currentPanel}
        totalPanels={totalPanels}
        isPanelTransitioning={isPanelTransitioning}
        onNext={onNext}
      />
    </motion.section>
  );
}
