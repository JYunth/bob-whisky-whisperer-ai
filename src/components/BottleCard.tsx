
import React from 'react';
import { Star } from 'lucide-react';
import { useBobStore } from '@/store/bobStore';
import { cn } from '@/lib/utils';
import type { Bottle } from '@/types/bottle';

type BottleCardProps = {
  bottle: Bottle;
  inWishlist: boolean;
  rationale?: string;
  showAlternatives?: () => void;
};

const BottleCard: React.FC<BottleCardProps> = ({ 
  bottle, inWishlist, rationale, showAlternatives 
}) => {
  const { toggleWishlist } = useBobStore();
  const { product } = bottle;
  
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(String(bottle.id));
  };

  const priceDisplay = product.average_msrp ? 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
      .format(product.average_msrp) : 'N/A';

  return (
    <div className="bob-card hover:border hover:border-bob-accent-secondary transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="w-20 h-20 bg-bob-bg-secondary rounded-md flex items-center justify-center overflow-hidden relative">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {bottle.fill_percentage < 100 && (
            <div 
              className="absolute bottom-0 left-0 right-0 bg-bob-bg-secondary/80 text-xs py-0.5 text-center"
            >
              {bottle.fill_percentage}% full
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-lg">{product.name}</h3>
              <p className="text-bob-text-secondary text-sm">{product.brand}</p>
            </div>
            
            <button 
              onClick={handleWishlistToggle}
              className={cn(
                "p-2 rounded-full transition-colors",
                inWishlist ? "text-bob-accent-primary" : "text-bob-text-secondary hover:text-bob-accent-primary"
              )}
            >
              <Star className={inWishlist ? "fill-bob-accent-primary" : ""} size={20} />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bob-badge bg-bob-bg-secondary text-bob-text-secondary">
              {product.spirit}
            </span>
            
            <span className="bob-badge bg-bob-bg-secondary text-bob-text-secondary">
              {priceDisplay}
            </span>
            
            <span className="bob-badge bg-bob-bg-secondary text-bob-text-secondary">
              {product.proof}°
            </span>
            
            {product.barrel_pick && (
              <span className="bob-badge bg-bob-accent-secondary/20 text-bob-text-secondary">
                Barrel Pick
              </span>
            )}
          </div>
          
          {rationale && (
            <div className="mt-3">
              <p className="text-bob-text-secondary text-sm italic">"{rationale}"</p>
            </div>
          )}
          
          {showAlternatives && (
            <div className="mt-3">
              <button 
                onClick={showAlternatives}
                className="bob-button-text text-sm py-1 flex items-center"
              >
                Show Alternatives
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottleCard;
