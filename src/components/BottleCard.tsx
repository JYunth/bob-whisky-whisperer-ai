
import React from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Import Badge
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
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(bottle.id);
  };

  // Determine the correct source for properties based on data structure
  const source = bottle.product ? bottle.product : (bottle as any);
  
  // Use the determined source for price, preferring avg_msrp for recommendations
  const priceValue = bottle.product ? bottle.product.average_msrp : (bottle as any).avg_msrp;
  const priceDisplay = priceValue ?
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
      .format(priceValue) : 'N/A';

  return (
    <div className="bob-card p-4 hover:border hover:border-bob-accent-secondary transition-all duration-200"> {/* Added p-4 */}
      <div className="flex items-start gap-4"> {/* Increased gap slightly */}
        <div className="w-20 h-20 bg-bob-bg-secondary rounded-md flex items-center justify-center overflow-hidden relative flex-shrink-0"> {/* Added flex-shrink-0 */}
          <img
            src={source.image_url || '/placeholder.svg'} // Access from determined source
            alt={source.name || 'Bottle image'} // Access from determined source
            className="w-full h-full object-cover"
          />
          {/* fill_percentage is always top-level */}
          {bottle.fill_percentage < 100 && (
            <div
              className="absolute bottom-0 left-0 right-0 bg-bob-bg-secondary/80 text-xs py-0.5 text-center"
            >
              {bottle.fill_percentage}% full
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-2"> {/* Added space-y-2 */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-lg">{source.name}</h3> {/* Access from determined source */}
              <p className="text-bob-text-secondary text-sm">{source.brand}</p> {/* Access from determined source */}
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
          
          <div className="flex flex-wrap gap-2"> {/* Removed mt-2, handled by space-y-2 */}
            <Badge variant="secondary">{source.spirit}</Badge> {/* Use Badge */}
            
            <Badge variant="secondary">{priceDisplay}</Badge> {/* Use Badge */}
            
            <Badge variant="secondary">{source.proof}°</Badge> {/* Use Badge */}
            
            {source.barrel_pick && ( // Access from determined source
              <Badge variant="outline" className="border-bob-accent-secondary/50 text-bob-text-secondary"> {/* Use Badge with outline */}
                Barrel Pick
              </Badge>
            )}
          </div>
          
          {rationale && (
            <div className="mt-2"> {/* Adjusted margin top */}
              <p className="text-bob-text-secondary text-base italic">"{rationale}"</p> {/* Increased font size */}
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
