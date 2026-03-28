
'use client';

import { ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface HouseholdBannerProps {
  cooksForToday: Record<string, string>;
  mealTypeTranslations: Record<string, string>;
}

export function HouseholdBanner({ cooksForToday, mealTypeTranslations }: HouseholdBannerProps) {
  const { t } = useTranslation();

  if (Object.keys(cooksForToday).length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 border border-primary/10 rounded-xl p-4 md:p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-0.5 text-left">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/60">{t('banner_org')}</h3>
            <p className="text-sm md:text-base font-black text-foreground">
              {(() => {
                const uniqueCooks = Array.from(new Set(Object.values(cooksForToday)));
                if (uniqueCooks.length === 1) {
                  return t('banner_one_cook', { name: uniqueCooks[0] });
                }
                return Object.entries(cooksForToday)
                  .map(([type, name]) => {
                    const translation = mealTypeTranslations[type] || type;
                    return `${translation} : ${name}`;
                  })
                  .join(' • ');
              })()}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary hover:bg-primary/10" asChild>
          <Link href="/cuisine">
            {t('banner_details')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
