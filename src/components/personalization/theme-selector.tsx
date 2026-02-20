'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type Theme = {
  name: string;
  hsl: string;
  accentHsl: string;
  className: string;
  color: string;
};

export const themes: Theme[] = [
  { name: 'Vert Forêt', hsl: '145 63% 29%', accentHsl: '145 50% 90%', className: 'bg-[#1C5D3E]', color: '#1C5D3E' },
  { name: 'Rose Orchidée', hsl: '336 78% 57%', accentHsl: '336 70% 92%', className: 'bg-[#E54B8A]', color: '#E54B8A' },
  { name: 'Rouge Passion', hsl: '0 78% 57%', accentHsl: '0 70% 92%', className: 'bg-[#E54B4B]', color: '#E54B4B' },
  { name: 'Jaune Solaire', hsl: '48 96% 50%', accentHsl: '48 90% 90%', className: 'bg-[#FFC700]', color: '#FFC700' },
  { name: 'Bleu Royal', hsl: '213 78% 57%', accentHsl: '213 70% 92%', className: 'bg-[#4B8BE5]', color: '#4B8BE5' },
  { name: 'Violet Mystique', hsl: '266 78% 57%', accentHsl: '266 70% 92%', className: 'bg-[#8A4BE5]', color: '#8A4BE5' },
  { name: 'Café Intense', hsl: '25 40% 35%', accentHsl: '25 40% 85%', className: 'bg-[#855D4A]', color: '#855D4A' },
  { name: 'Gris Sidéral', hsl: '240 5% 50%', accentHsl: '240 5% 90%', className: 'bg-[#808080]', color: '#808080' },
  { name: 'Noir Onyx', hsl: '240 10% 11%', accentHsl: '240 5% 20%', className: 'bg-[#1C1C1E]', color: '#1C1C1E' },
];

interface ThemeSelectorProps {
  onThemeChange: (theme: Theme) => void;
  selectedThemeName?: string;
}

export function ThemeSelector({ onThemeChange, selectedThemeName }: ThemeSelectorProps) {
  const selectedTheme = themes.find(t => t.name === selectedThemeName) || themes[0];

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center justify-center gap-4 py-2">
        {themes.map((theme) => {
          const isSelected = selectedTheme.name === theme.name;

          return (
            <Tooltip key={theme.name}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onThemeChange(theme)}
                    className={cn(
                      'relative h-12 w-12 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center overflow-hidden shadow-lg',
                      isSelected
                        ? 'border-white ring-4 ring-primary/20 scale-110'
                        : 'border-transparent hover:border-white/40'
                    )}
                    style={{ backgroundColor: theme.color }}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="relative z-10"
                        >
                          <Check className="h-6 w-6 text-white stroke-[4px]" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Subtle internal gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                  </motion.button>

                  {/* External Glow if selected */}
                  {isSelected && (
                    <motion.div
                      layoutId="glow"
                      className="absolute inset-0 blur-2xl opacity-40 rounded-full -z-10"
                      style={{ backgroundColor: theme.color }}
                    />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="rounded-xl font-bold bg-background/80 backdrop-blur-md border-2">
                <p>{theme.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
