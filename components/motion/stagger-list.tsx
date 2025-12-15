"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

type StaggerListProps = HTMLMotionProps<"div"> & {
  delay?: number;
  duration?: number;
  itemClassName?: string;
};

export function StaggerList({
  children,
  className,
  delay = 0,
  duration = 0.35,
  itemClassName,
  ...rest
}: StaggerListProps) {
  const reduceMotion = useReducedMotion();

  const container = reduceMotion
    ? {}
    : {
        animate: {
          transition: {
            staggerChildren: 0.08,
            delayChildren: delay,
          },
        },
      };

  const item = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0, transition: { duration } },
      };

  return (
    <motion.div className={cn("flex flex-wrap gap-4", className)} {...container} {...rest}>
      {Array.isArray(children)
        ? children.map((child, idx) => (
            <motion.div key={idx} className={itemClassName} {...item}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}
