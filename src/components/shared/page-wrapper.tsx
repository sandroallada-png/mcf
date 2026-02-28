'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

const variants = {
  initial: {
    opacity: 0,
    x: 20,
    // On mobile, the slide is more pronounced
    // x: '100%', 
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.98,
  },
};

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ 
        type: 'spring', 
        stiffness: 380, 
        damping: 30,
        mass: 0.8
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
