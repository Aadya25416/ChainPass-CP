import { motion } from "framer-motion";
import { useState } from "react";
import Carousel from "./Carousel";

const HeroSection = ({ onExplore }: { onExplore?: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleExplore = () => {
    setIsExiting(true);
    setTimeout(() => {
      onExplore?.();
    }, 500);
  };

  return (
    <motion.section 
      className="relative h-screen w-full overflow-hidden bg-background"
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Carousel layer */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <Carousel />
      </motion.div>

      {/* Vignette + readability overlay */}
      <div className="vignette pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(0 0% 0% / 0.55) 0%, hsl(0 0% 0% / 0.25) 35%, transparent 70%)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.span
          className="mb-5 text-xs uppercase tracking-[0.32em] text-hero-muted"
          style={{ color: "hsl(var(--hero-muted))" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          Web3 Ticketing · Reimagined
        </motion.span>

        <motion.h1
          className="text-6xl md:text-8xl lg:text-[9rem] leading-none font-semibold"
          style={{
             color: "#b886ff",
             textShadow: "0 0 5px #fff, 0 0 10px #b886ff, 0 0 20px #b886ff, 0 0 40px #9168ff, 0 0 80px #9168ff"
          }}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          ChainPass
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-base md:text-lg text-hero-muted"
          style={{ color: "hsl(var(--hero-muted))" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Verifiable tickets for unforgettable nights — concerts, stadiums, festivals.
          Owned by you, secured on-chain.
        </motion.p>

        <motion.div
          className="mt-10 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <button 
            onClick={handleExplore}
            className="rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #b886ff, #9168ff)', color: '#10121a' }}
          >
            Explore Events
          </button>
          <button className="rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium text-foreground/90 backdrop-blur-md transition-colors hover:border-foreground/40">
            How it works
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
