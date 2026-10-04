"use client";

/*
 * BentoGrid + BentoCard — converted from the provided TSX/Tailwind source
 * to JSX + vanilla CSS for this Vite project (no Tailwind/TS here).
 * Motion contract unchanged (staggered container, item fade-rise),
 * driven by `motion/react` (same library as framer-motion, new name).
 */
import { motion } from 'motion/react';
import { cn } from '../../lib/cn.js';
import './bento-grid.css';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function BentoGrid({ className, children }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={cn('bento-grid', className)}
    >
      {children}
    </motion.div>
  );
}

export function BentoCard({ title, description, icon, colSpan, className, children }) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn('bento-card', colSpan === 2 && 'bento-span-2', className)}
    >
      <div className="bento-media">{children}</div>
      <div className="bento-head">
        {icon && <span className="bento-icon">{icon}</span>}
        <div className="bento-text">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default BentoGrid;
