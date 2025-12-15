"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback } from "react";

type MagneticButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export function MagneticButton({ children, className }: MagneticButtonProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  const handlePointerMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
      const offsetX = event.clientX - (left + width / 2);
      const offsetY = event.clientY - (top + height / 2);
      x.set(offsetX * 0.1);
      y.set(offsetY * 0.1);
    },
    [x, y],
  );

  const resetPosition = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPosition}
    >
      {children}
    </motion.div>
  );
}
