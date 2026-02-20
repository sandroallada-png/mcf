
'use client';

import { cn } from '@/lib/utils';
import { Flame, Leaf, ChefHat, Gem, Crown, Star } from 'lucide-react';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

const levelTiers = [
  { min: 1, icon: Leaf, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/50' },
  { min: 10, icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/50' },
  { min: 20, icon: ChefHat, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/50' },
  { min: 30, icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50' },
  { min: 40, icon: Gem, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/50' },
  { min: 50, icon: Crown, color: 'text-pink-500', bgColor: 'bg-pink-100 dark:bg-pink-900/50' },
];

export function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
  const tier = [...levelTiers].reverse().find(t => level >= t.min) || levelTiers[0];
  const Icon = tier.icon;

  const sizeClasses = {
    sm: { wrapper: 'h-10 w-10', icon: 'h-5 w-5', badge: 'h-4 w-4 text-[8px]' },
    md: { wrapper: 'h-14 w-14', icon: 'h-7 w-7', badge: 'h-5 w-5 text-[10px]' },
    lg: { wrapper: 'h-24 w-24', icon: 'h-12 w-12', badge: 'h-7 w-7 text-[12px]' },
  };

  return (
    <div className="relative group">
      {/* Glow Background */}
      <div className={cn(
        "absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full",
        tier.bgColor.replace('/50', '/30')
      )} />

      <div className={cn(
        'relative flex items-center justify-center rounded-[30%] rotate-45 border-2 border-white/10 shadow-2xl transition-transform duration-500 group-hover:rotate-[225deg]',
        sizeClasses[size].wrapper,
        tier.bgColor,
        'backdrop-blur-md'
      )}>
        <div className="-rotate-45 group-hover:-rotate-[225deg] transition-transform duration-500">
          <Icon className={cn(sizeClasses[size].icon, tier.color, "drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]")} />
        </div>

        {/* Level Indicator Badge */}
        <div className={cn(
          "absolute -bottom-1 -right-1 flex items-center justify-center rounded-full font-black bg-white text-black shadow-lg border-2 border-background -rotate-45 group-hover:-rotate-[225deg] transition-transform duration-500",
          sizeClasses[size].badge
        )}>
          {level}
        </div>
      </div>
    </div>
  );
}
