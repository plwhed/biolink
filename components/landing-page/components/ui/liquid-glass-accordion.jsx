"use client";

/*
 * LiquidGlassAccordion — converted from the provided TSX/Tailwind source
 * to JSX + vanilla CSS (no Tailwind/TS in this project). State machine,
 * motion contract (tap handled by actuation + height auto animation) and
 * single/multi-open behavior unchanged. Driven by `motion/react`.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import './liquid-glass-accordion.css';

export function LiquidGlassAccordion({
  items,
  className = '',
  allowMultiple = false,
  defaultOpen = [],
}) {
  const [openItems, setOpenItems] = useState(() => new Set(defaultOpen));

  const toggle = id => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`lg-acc ${className}`}>
      {items.map(item => {
        const isOpen = openItems.has(item.id);
        return (
          <motion.div key={item.id} className={`lg-item${isOpen ? ' open' : ''}`}>
            <motion.button
              whileTap={{ scale: 0.99 }}
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="lg-btn"
            >
              {item.icon && <span className="lg-ico">{item.icon}</span>}
              <span className="lg-title">{item.title}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="lg-chev"
              >
                <ChevronDown size={16} />
              </motion.span>
            </motion.button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="lg-body">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

export default LiquidGlassAccordion;
