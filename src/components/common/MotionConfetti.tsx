import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  rotate: number;
  targetRotate: number;
  scale: number;
  color: string;
  size: number;
  shape: "rect" | "circle" | "strip";
  duration: number;
  delay: number;
}

interface MotionConfettiProps {
  active: boolean;
  onComplete?: () => void;
  durationMs?: number;
  particleCount?: number;
}

const COLORS = [
  "#00d2ff", // electric neon blue
  "#00b4d8", // cyan-azure
  "#38bdf8", // sky-400
  "#3b82f6", // cobalt blue
  "#fbbf24", // amber-400
  "#f59e0b", // amber-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#ffffff", // pure white
];

export const MotionConfetti: React.FC<MotionConfettiProps> = ({
  active,
  onComplete,
  durationMs = 2800,
  particleCount = 55,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Generate random explosion particles
    const generated: Particle[] = Array.from({ length: particleCount }).map((_, i) => {
      // Angle between 200° and 340° (burst upwards and outwards)
      const angle = (Math.PI / 180) * (200 + Math.random() * 140);
      const velocity = 180 + Math.random() * 340;
      const targetX = Math.cos(angle) * velocity + (Math.random() - 0.5) * 80;
      const targetY = Math.sin(angle) * velocity + Math.random() * 120; // gravity pull

      const shapes: ("rect" | "circle" | "strip")[] = ["rect", "circle", "strip"];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      return {
        id: i,
        x: 0,
        y: 0,
        targetX,
        targetY,
        rotate: 0,
        targetRotate: (Math.random() - 0.5) * 720,
        scale: 0.7 + Math.random() * 0.7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: shape === "strip" ? 14 : 7 + Math.random() * 7,
        shape,
        duration: 1.8 + Math.random() * 1.0,
        delay: Math.random() * 0.15,
      };
    });

    setParticles(generated);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [active, durationMs, particleCount, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-70 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <AnimatePresence>
        {particles.map((p) => {
          const isStrip = p.shape === "strip";
          const isCircle = p.shape === "circle";

          return (
            <motion.div
              key={p.id}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: p.targetX,
                y: [0, p.targetY * 0.6, p.targetY + 120], // curve up then fall down
                opacity: [1, 1, 0.9, 0],
                scale: [0, p.scale, p.scale * 0.8],
                rotate: p.targetRotate,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                position: "absolute",
                backgroundColor: p.color,
                width: isStrip ? `${p.size * 0.45}px` : `${p.size}px`,
                height: isStrip ? `${p.size * 1.6}px` : `${p.size}px`,
                borderRadius: isCircle ? "50%" : isStrip ? "2px" : "3px",
                boxShadow: `0 0 10px ${p.color}80`,
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};
