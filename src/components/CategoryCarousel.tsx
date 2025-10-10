import { useRef } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Category } from 'src/intefaces/interfaz';

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          className={cn(
            'flex-shrink-0 transition-all',
            selectedCategory === null && 'bg-primary text-primary-foreground shadow-lg'
          )}
          onClick={() => onSelectCategory(null)}
        >
          Todos
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            className={cn(
              'flex-shrink-0 transition-all',
              selectedCategory === category.id && 'bg-primary text-primary-foreground shadow-lg'
            )}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.nombre}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryCarousel;
