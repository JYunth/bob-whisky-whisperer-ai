import React, { useState } from 'react';
// Star import removed
// Badge import removed
// useBobStore import removed
import { cn } from "@/lib/utils"; // Re-import cn
import type { Bottle } from '@/types/bottle';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BottleDetailModal from './BottleDetailModal'; // Import the modal


type BottleCardProps = {
  bottle: Bottle;
  context: 'recommendation' | 'bar' | 'wishlist'; // Add context prop
  // inWishlist removed as per new design
  rationale?: string;
  // showAlternatives removed as per new design
};

const BottleCard: React.FC<BottleCardProps> = ({
  bottle, rationale, context // Destructure context
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  // Wishlist logic removed as per new design

  // Determine the correct source for properties based on data structure
  // Simplified assumption: data is directly on bottle or bottle.product
  const name = bottle.name ?? 'Unknown Name';
  const imageUrl = bottle.image_url ?? '/placeholder.svg';
  const spirit = bottle.spirit_type ?? ''; // Use spirit_type from Bottle type
  const size = bottle.size; // Use size directly from Bottle type
  const proof = bottle.proof; // Use proof directly from Bottle type

  // Determine the price: prioritize fair_price, then avg_msrp from product or root
  const priceValue = bottle.fair_price ?? bottle.avg_msrp; // Use fair_price and avg_msrp from Bottle type
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
    <> {/* Fragment to hold Card and Modal */}
      <Card
        className={cn(
          "w-full overflow-hidden bg-[#FBF9F5] border border-gray-200/80 rounded-xl shadow-sm flex flex-col font-sans",
          context === 'recommendation' && "cursor-pointer" // Conditional cursor
        )}
        onClick={() => {
          if (context === 'recommendation') { // Conditional modal open
            setIsModalOpen(true);
          }
        }}
      > {/* Removed max-w-[300px] */}
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
      {/* Conditionally render the modal */}
      <BottleDetailModal
        bottle={bottle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default BottleCard;
