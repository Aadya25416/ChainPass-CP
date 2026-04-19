import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

/**
 * Netflix-style cinematic intro:
 * 1. Thin vertical line appears
 * 2. Line expands into "CP" monogram
 * 3. Colored light streaks sweep across
 * 4. "CP" elongates into full "ChainPass" wordmark
 * 5. Fades out
 */
const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 250),   // line -> CP reveal
      setTimeout(() => setPhase(2), 1100),  // streaks sweep
      setTimeout(() => setPhase(3), 4000),  // CP -> ChainPass (slowed +2s)
      setTimeout(() => setPhase(4), 5400),  // fade out
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 4 ? 0 : 1 }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={() => phase === 4 && onComplete()}
    >
      {/* Thin seed line that expands */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-foreground"
        initial={{ width: 2, height: 0, opacity: 0 }}
        animate={
          phase === 0
            ? { width: 2, height: 90, opacity: 1 }
            : { width: 2, height: 90, opacity: 0 }
        }
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* CP monogram — appears, then morphs out */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase >= 1 && phase < 3 ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.span
          className="select-none font-semibold"
          style={{ 
             fontSize: "9rem", 
             letterSpacing: "-0.04em", 
             lineHeight: 1,
             color: "#b886ff",
             textShadow: "0 0 5px #fff, 0 0 10px #b886ff, 0 0 20px #b886ff, 0 0 40px #9168ff, 0 0 80px #9168ff"
          }}
          initial={{ scaleX: 0.02, scaleY: 0.4, opacity: 0 }}
          animate={
            phase >= 1
              ? { scaleX: 1, scaleY: 1, opacity: 1 }
              : { scaleX: 0.02, scaleY: 0.4, opacity: 0 }
          }
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          CP
        </motion.span>
      </motion.div>

      {/* Light streaks sweep — subtle, premium (not neon) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 2 ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative h-40 w-[80vw] overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute top-0 h-full w-px bg-foreground/70"
              style={{ left: `${(i / 14) * 100}%` }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={
                phase === 2
                  ? { scaleY: [0, 1, 1, 0], opacity: [0, 0.9, 0.9, 0] }
                  : { scaleY: 0, opacity: 0 }
              }
              transition={{
                duration: 0.9,
                delay: i * 0.025,
                ease: "easeInOut",
              }}
            />
          ))}
          {/* horizontal sweep highlight */}
          <motion.div
            className="absolute top-0 h-full w-1/3"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.18), transparent)",
            }}
            initial={{ x: "-120%" }}
            animate={phase === 2 ? { x: "320%" } : { x: "-120%" }}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </motion.div>

      {/* ChainPass full wordmark — emerges from the CP collapse */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 3 ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h1
          className="text-5xl md:text-7xl tracking-tight select-none font-semibold"
          style={{
             color: "#b886ff",
             textShadow: "0 0 5px #fff, 0 0 10px #b886ff, 0 0 20px #b886ff, 0 0 40px #9168ff, 0 0 80px #9168ff"
          }}
          initial={{ scaleX: 0.35, opacity: 0, filter: "blur(6px)" }}
          animate={
            phase >= 3
              ? { scaleX: 1, opacity: 1, filter: "blur(0px)" }
              : { scaleX: 0.35, opacity: 0, filter: "blur(6px)" }
          }
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        >
          ChainPass
        </motion.h1>
      </motion.div>

      {/* soft radial light reflection */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 && phase < 4 ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        style={{
          background:
            "radial-gradient(700px 220px at 50% 50%, hsl(0 0% 100% / 0.10), transparent 70%)",
        }}
      />
    </motion.div>
  );
};

export default IntroAnimation;
