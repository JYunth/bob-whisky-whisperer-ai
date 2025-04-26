
import React from 'react';
import { Star } from 'lucide-react';
import { useBobStore } from '@/store/bobStore';

type BottleCardProps = {
  id: string;
  name: string;
  distillery: string;
  region: string;
  age?: number;
  price: number;
  image: string;
  tags: string[];
  inWishlist: boolean;
  rationale?: string;
  showAlternatives?: () => void;
};

const BottleCard: React.FC<BottleCardProps> = ({ 
  id, name, distillery, region, age, price, image, tags, 
  inWishlist, rationale, showAlternatives 
}) => {
  const { toggleWishlist } = useBobStore();
  
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(id);
  };

  return (
    <div className="bob-card hover:border hover:border-bob-accent-secondary transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="w-20 h-20 bg-bob-bg-secondary rounded-md flex items-center justify-center overflow-hidden">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-lg">{name}</h3>
              <p className="text-bob-text-secondary text-sm">{distillery}</p>
            </div>
            
            <button 
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full transition-colors ${
                inWishlist 
                  ? 'text-bob-accent-primary' 
                  : 'text-bob-text-secondary hover:text-bob-accent-primary'
              }`}
            >
              <Star className={inWishlist ? "fill-bob-accent-primary" : ""} size={20} />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bob-badge bg-bob-bg-secondary text-bob-text-secondary">
              {region}
            </span>
            
            <span className="bob-badge bg-bob-bg-secondary text-bob-text-secondary">
              ${price}
            </span>
            
            {age && (
              <span className="bob-badge bg-bob-bg-secondary text-bob-text-secondary">
                {age}yr
              </span>
            )}
            
            {tags
              .filter(tag => tag !== region)
              .slice(0, 3)
              .map(tag => (
                <span 
                  key={tag} 
                  className="bob-badge bg-bob-bg-secondary text-bob-text-secondary"
                >
                  {tag}
                </span>
              ))}
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
