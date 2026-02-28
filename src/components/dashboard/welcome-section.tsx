
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface WelcomeSectionProps {
  userName: string;
  contextualMessage: string;
  contextualImage: string;
}

export function WelcomeSection({ userName, contextualMessage, contextualImage }: WelcomeSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-background to-secondary/5 border border-primary/5 p-6 md:p-8 shadow-sm">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground leading-none">
              Salut, <span className="text-primary">{userName}</span> !
            </h1>
            <p className="mt-4 text-sm md:text-base font-medium text-muted-foreground/80 leading-relaxed max-w-md">
              Voici un aperçu de votre journée. {contextualMessage}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative h-48 w-48 md:h-56 md:w-56"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-full h-full relative"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
            <Image
              src={contextualImage}
              alt="Dashboard"
              width={300}
              height={300}
              className="relative z-10 w-full h-full object-contain drop-shadow-2xl brightness-110"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl opacity-50" />
    </div>
  );
}
