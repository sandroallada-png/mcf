'use client';

import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface TextCarouselProps {
  items: { id: string; label: string }[];
  activeItemId: string;
  onItemClick: (id: string) => void;
  className?: string;
}

export function TextCarousel({ items, activeItemId, onItemClick, className }: TextCarouselProps) {
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true, stopOnMouseEnter: true }));

  return (
    <div className="overflow-hidden">
        <Carousel
            opts={{
                align: "start",
                loop: false,
                dragFree: true,
            }}
            className={cn("w-full", className)}
        >
        <CarouselContent>
            {items.map((item, index) => (
            <CarouselItem key={index} className="basis-auto">
                <Button 
                    variant={activeItemId === item.id ? 'default' : 'outline'}
                    onClick={() => onItemClick(item.id)}
                    className="rounded-full"
                >
                    {item.label}
                </Button>
            </CarouselItem>
            ))}
        </CarouselContent>
        </Carousel>
    </div>
  );
}
