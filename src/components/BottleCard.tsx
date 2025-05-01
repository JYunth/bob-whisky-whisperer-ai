import React from 'react';
// Star import removed
// Badge import removed
// useBobStore import removed
// cn import removed
import type { Bottle } from '@/types/bottle';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


type BottleCardProps = {
  bottle: Bottle;
  // inWishlist removed as per new design
  rationale?: string;
  // showAlternatives removed as per new design
};

const BottleCard: React.FC<BottleCardProps> = ({
  bottle, rationale
}) => {
  // Wishlist logic removed as per new design

  // Determine the correct source for properties based on data structure
  // Simplified assumption: data is directly on bottle or bottle.product
  const name = bottle.product?.name ?? (bottle as any).name ?? 'Unknown Name';
  const imageUrl = bottle.product?.image_url ?? (bottle as any).image_url ?? '/placeholder.svg';
  const spirit = bottle.product?.spirit ?? (bottle as any).spirit ?? ''; // Use spirit instead of category
  const size = bottle.product?.size ?? (bottle as any).size; // Use size instead of volumeMl
  const proof = bottle.product?.proof ?? (bottle as any).proof; // e.g., 95

  // Determine the price: prioritize fair_price, then avg_msrp from product or root
  const priceValue = (bottle as any).fair_price ?? bottle.product?.average_msrp ?? (bottle as any).avg_msrp;
  const priceDisplay = priceValue != null ? // Check for null or undefined
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
      .format(priceValue) : 'Price Unavailable'; // Display fallback text

  // Construct details string
  const details = [
    spirit, // Use spirit
    size, // Use size directly as it's a string like "750 ml"
    proof ? `${proof} Proof` : null
  ].filter(Boolean).join(' | '); // Filter out null/undefined/empty values and join

  return (
    <Card className="w-full overflow-hidden bg-[#FBF9F5] border border-gray-200/80 rounded-xl shadow-sm flex flex-col font-sans"> {/* Removed max-w-[300px] */}
      <div className="p-6 flex justify-center items-center bg-white h-64"> {/* Image container with padding, white bg, fixed height */}
        <img
          src={imageUrl}
          alt={name}
          className="max-h-full w-auto object-contain" // Ensure image fits container
        />
        {/* Fill percentage removed as not in design */}
      </div>

      <div className="p-5 flex flex-col flex-grow"> {/* Padding for text content area, flex-grow */}
        <CardHeader className="p-0 mb-1"> {/* Remove default padding, add margin */}
          <CardTitle className="font-serif font-semibold text-lg leading-tight text-[#3D3A3A]">{name}</CardTitle> {/* Serif font, size, color */}
          {details && (
             <CardDescription className="font-sans text-xs text-[#8E8B87] pt-1">{details}</CardDescription> // Sans font, size, color
          )}
        </CardHeader>

        <CardContent className="p-0 mb-3"> {/* Remove default padding, add margin */}
          <p className="font-serif text-4xl text-[#3D3A3A]">{priceDisplay}</p> {/* Serif font, size, color */}
        </CardContent>

        {rationale && (
          <CardFooter className="p-0 mt-auto"> {/* Remove default padding, push to bottom */}
            <p className="font-sans text-xs text-[#6B6865] italic">"{rationale}"</p> {/* Sans font, size, color */}
          </CardFooter>
        )}
        {/* Wishlist button removed */}
        {/* showAlternatives button removed */}
      </div>
    </Card>
  );
};

export default BottleCard;
