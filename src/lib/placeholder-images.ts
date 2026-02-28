import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  title?: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  price?: string;
  category?: 'fresh' | 'spices' | 'prepared' | 'restaurant' | 'recipe' | 'guide';
};
export const placeholderImages: ImagePlaceholder[] = data.placeholderImages as ImagePlaceholder[];
    

    