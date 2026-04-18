import { useEffect, useRef } from "react";

const PALETTES = {
  menu: ["#4cc9f0", "#90e0ef", "#4895ef"],
  pathogen: ["#34d399", "#4cc9f0", "#ef4444"],
  response: ["#4cc9f0", "#22c55e", "#ef4444"],
  attack: ["#60a5fa", "#22c55e", "#ef4444"],
  failure: ["#ef4444", "#f97316", "#f59e0b"],
  memory: ["#4cc9f0", "#facc15", "#a78bfa"],
  victory: ["#34d399", "#facc15", "#4cc9f0"],
};

export default function GameCanvas({ mode = "menu", sceneType = "menu", actionPulse = 0 }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const burstsRef = useRef([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const count = Math.max(90, Math.floor((canvas.width * canvas.height) / 16000));
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1 + Math.random() * 2.6,
        vx: 0.2 + Math.random() * 0.8,
        vy: -0.2 + Math.random() * 0.4,
        depth: 0.4 + Math.random() * 1.8,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const drawSceneActors = (time) => {
      const t = time * 0.001;
      const cx = canvas.width * 0.52;
      const cy = canvas.height * 0.5;

      if (sceneType === "pathogen") {
        const px = cx + Math.sin(t * 1.8) * 160;
        const py = cy + Math.cos(t * 1.2) * 60;
        context.fillStyle = "rgba(239, 68, 68, 0.9)";
        context.beginPath();
        context.arc(px, py, 34, 0, Math.PI * 2);
        context.fill();
      }

      if (sceneType === "response") {
        const threatX = cx + Math.sin(t * 1.7) * 130;
        const threatY = cy + Math.cos(t * 1.1) * 50;
        const immuneX = cx - 170 + (Math.sin(t * 2.5) + 1) * 80;
        const immuneY = cy + Math.sin(t * 2) * 20;

        context.fillStyle = "rgba(239, 68, 68, 0.85)";
        context.beginPath();
        context.arc(threatX, threatY, 30, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = "rgba(34, 197, 94, 0.9)";
        context.beginPath();
        context.arc(immuneX, immuneY, 24, 0, Math.PI * 2);
        context.fill();
      }

      if (sceneType === "attack") {
        const leftX = cx - 140 + Math.sin(t * 2.2) * 24;
        const rightX = cx + 120 - Math.sin(t * 2.2) * 24;
        const y = cy + Math.cos(t * 1.6) * 12;

        context.fillStyle = "rgba(96, 165, 250, 0.9)";
        context.beginPath();
        context.arc(leftX, y, 26, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = "rgba(239, 68, 68, 0.88)";
        context.beginPath();
        context.arc(rightX, y, 28, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = "rgba(125, 211, 252, 0.35)";
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(leftX + 26, y);
        context.lineTo(rightX - 28, y);
        context.stroke();
      }

      if (sceneType === "failure") {
        for (let i = 0; i < 10; i += 1) {
          const x1 = Math.random() * canvas.width;
          const y1 = Math.random() * canvas.height;
          const x2 = x1 + (Math.random() * 120 - 60);
          const y2 = y1 + (Math.random() * 120 - 60);
          context.strokeStyle = "rgba(248, 113, 113, 0.23)";
          context.lineWidth = 1 + Math.random() * 2;
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.stroke();
        }
      }

      if (sceneType === "memory") {
        const nodes = 8;
        for (let i = 0; i < nodes; i += 1) {
          const angle = (Math.PI * 2 * i) / nodes + t * 0.2;
          const nx = cx + Math.cos(angle) * 150;
          const ny = cy + Math.sin(angle) * 90;

          context.fillStyle = "rgba(250, 204, 21, 0.9)";
          context.beginPath();
          context.arc(nx, ny, 7, 0, Math.PI * 2);
          context.fill();

          context.strokeStyle = "rgba(250, 204, 21, 0.3)";
          context.lineWidth = 2;
          context.beginPath();
          context.moveTo(cx, cy);
          context.lineTo(nx, ny);
          context.stroke();
        }

        context.fillStyle = "rgba(76, 201, 240, 0.9)";
        context.beginPath();
        context.arc(cx, cy, 16, 0, Math.PI * 2);
        context.fill();
      }

      if (sceneType === "victory") {
        context.strokeStyle = "rgba(52, 211, 153, 0.8)";
        context.lineWidth = 6;
        context.beginPath();
        context.arc(cx, cy, 120 + Math.sin(t * 1.8) * 8, 0, Math.PI * 2);
        context.stroke();

        context.strokeStyle = "rgba(250, 204, 21, 0.7)";
        context.lineWidth = 3;
        context.beginPath();
        context.arc(cx, cy, 78 + Math.cos(t * 2.2) * 6, 0, Math.PI * 2);
        context.stroke();
      }
    };

    const render = (time) => {
      const palette = PALETTES[mode === "menu" ? "menu" : sceneType] || PALETTES.menu;

      context.fillStyle = "rgba(2, 6, 23, 0.28)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx * particle.depth;
        particle.y += particle.vy * particle.depth + Math.sin((time * 0.001) + index) * 0.05;

        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.x < -20) particle.x = canvas.width + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;
        if (particle.y < -20) particle.y = canvas.height + 20;

        context.beginPath();
        context.fillStyle = `${palette[index % palette.length]}66`;
        context.arc(particle.x, particle.y, particle.r * particle.depth, 0, Math.PI * 2);
        context.fill();
      });

      drawSceneActors(time);

      burstsRef.current = burstsRef.current.filter((burst) => burst.life > 0);
      burstsRef.current.forEach((burst) => {
        burst.life -= 1;
        burst.radius += 4.2;
        context.strokeStyle = `rgba(125, 211, 252, ${burst.life / 26})`;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
        context.stroke();
      });

      rafRef.current = window.requestAnimationFrame(render);
    };

    rafRef.current = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(rafRef.current);
    };
  }, [mode, sceneType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    burstsRef.current.push({ x: canvas.width * 0.5, y: canvas.height * 0.5, radius: 12, life: 26 });
  }, [actionPulse]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
