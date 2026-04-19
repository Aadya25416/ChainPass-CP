import { motion } from "framer-motion";
import event1 from "../assets/event-1.jpg";
import event2 from "../assets/event-2.jpg";
import event3 from "../assets/event-3.jpg";
import event4 from "../assets/event-4.jpg";
import event5 from "../assets/event-5.jpg";
import event6 from "../assets/event-6.jpg";

const images = [event1, event2, event3, event4, event5, event6];

interface RowProps {
  reverse?: boolean;
  duration?: number;
  scale?: number;
  opacity?: number;
}

const Row = ({ reverse = false, duration = 60, scale = 1, opacity = 1 }: RowProps) => {
  // duplicate the set so the loop is seamless
  const items = [...images, ...images];

  return (
    <div className="flex w-max gap-6" style={{ opacity }}>
      <motion.div
        className="flex gap-6"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
        style={{ width: "max-content" }}
      >
        {items.map((src, i) => (
          <div
            key={i}
            className="card-shadow overflow-hidden rounded-2xl bg-background/40"
            style={{
              width: `${320 * scale}px`,
              height: `${200 * scale}px`,
            }}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const Carousel = () => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ perspective: "1400px" }}
      aria-hidden
    >
      <div
        className="flex flex-col gap-8"
        style={{
          transform: "rotate(-14deg) rotateX(8deg)",
          transformStyle: "preserve-3d",
          width: "180vw",
        }}
      >
        <Row duration={90} scale={0.85} opacity={0.55} />
        <Row reverse duration={70} scale={1.05} opacity={0.85} />
        <Row duration={110} scale={0.9} opacity={0.55} />
      </div>
    </div>
  );
};

export default Carousel;
