'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
  animation?: 'zoom' | 'slide' | 'fade';
}

export default function PageTransitionWrapper({
  children,
  animation = 'zoom',
}: PageTransitionWrapperProps) {
  const variants = {
    zoom: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    slide: {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 },
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
  };

  const currentVariant = variants[animation] || variants.zoom;

  return (
    <motion.div
      initial={currentVariant.initial}
      animate={currentVariant.animate}
      exit={currentVariant.exit}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
