"use client";

/*
 * BorderBeam — Magic UI (magicuidesign/magicui, MIT).
 * Same motion contract as the registry source: a light beam travelling the
 * container border via CSS offset-path, driven by motion's offsetDistance.
 * Adapted: Tailwind v4 arbitrary utilities replaced with vanilla-CSS classes
 * (.bb-wrap / .bb-beam in bits.css). Colors passed as props.
 */
import { motion } from 'motion/react';

export const BorderBeam = ({
  className = '',
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}) => {
  return (
    <div
      className="bb-wrap"
      style={{
        '--bb-width': `${borderWidth}px`,
      }}
    >
      <motion.div
        className={`bb-beam ${className}`}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          '--beam-from': colorFrom,
          '--beam-to': colorTo,
          ...style,
        }}
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  );
};
