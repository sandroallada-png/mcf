
'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAccentTheme } from '@/contexts/accent-theme-context';


export type Theme = {
  name: string;
  hsl: string;
  accentHsl: string;
  className: string;
};

export const themes: Theme[] = [
  { name: 'Vert (défaut)', hsl: '145 63% 29%', accentHsl: '145 50% 90%', className: 'bg-primary' },
  { name: 'Rose', hsl: '336 78% 57%', accentHsl: '336 70% 92%', className: 'bg-[#E54B8A]' },
  { name: 'Rouge', hsl: '0 78% 57%', accentHsl: '0 70% 92%', className: 'bg-[#E54B4B]' },
  { name: 'Jaune', hsl: '48 96% 50%', accentHsl: '48 90% 90%', className: 'bg-[#FFC700]' },
  { name: 'Bleu', hsl: '213 78% 57%', accentHsl: '213 70% 92%', className: 'bg-[#4B8BE5]' },
  { name: 'Violet', hsl: '266 78% 57%', accentHsl: '266 70% 92%', className: 'bg-[#8A4BE5]' },
  { name: 'Café', hsl: '25 40% 35%', accentHsl: '25 40% 85%', className: 'bg-[#855D4A]' },
  { name: 'Cendre', hsl: '240 5% 50%', accentHsl: '240 5% 90%', className: 'bg-[#808080]' },
  { name: 'Noir', hsl: '240 10% 11%', accentHsl: '240 5% 20%', className: 'bg-[#1C1C1E]' },
];

interface ThemeSelectorProps {
  onThemeChange: (theme: Theme) => void;
  selectedThemeName?: string;
}

export function ThemeSelector({ onThemeChange, selectedThemeName }: ThemeSelectorProps) {
  const selectedTheme = themes.find(t => t.name === selectedThemeName) || themes[0];
  
  const handleSelect = (theme: Theme) => {
    onThemeChange(theme);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-3">
        {themes.map((theme) => (
          <Tooltip key={theme.name}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => handleSelect(theme)}
                className={cn(
                  'border-2 transition-all duration-200 flex items-center justify-center',
                  theme.name === 'Vert (défaut)' ? 'rounded-md' : 'rounded-full',
                  theme.className,
                  selectedTheme.name === theme.name
                    ? 'h-12 w-12 border-foreground/80'
                    : 'h-10 w-10 border-transparent hover:scale-105'
                )}
                aria-label={`Sélectionner le thème ${theme.name}`}
              >
                {selectedTheme.name === theme.name && <Check className="h-6 w-6 text-white" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{theme.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
