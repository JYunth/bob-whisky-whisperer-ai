// Keep existing User interface
export interface User {
  user_name: string;
}

// Keep existing Product interface (though potentially redundant/needs refactor later)
export interface Product {
  id: number;
  name: string;
  image_url: string;
  brand_id: number;
  brand: string;
  spirit: string; // Field not in new API example
  size: string;
  proof: number;
  average_msrp: number; // Different name in new API example (avg_msrp)
  fair_price: number;
  shelf_price: number;
  popularity: number;
  barrel_pick: boolean; // Field not in new API example
  verified_date: string; // Field not in new API example
}

// Define the nested type for spirit profile
interface SpiritProfile {
  Sweet: number;
  Floral: number;
  Woody: number;
  Spicy: number;
  Smoky: number;
  Fruity: number;
  Smooth: number;
}

// Updated Bottle interface based on the API example
export interface Bottle {
  id: number;
  name: string;
  size: string | number; // Handle potential string or number
  proof: number;
  abv: number;
  spirit_type: string;
  brand_id: number;
  popularity: number;
  image_url: string;
  avg_msrp: number;
  fair_price: number;
  shelf_price: number;
  total_score: number;
  wishlist_count: number;
  vote_count: number;
  bar_count: number;
  ranking: number;
  brand: string;
  description: string;
  msrp: number;
  spirit_profile: SpiritProfile; // Use the nested type
}

// Note: The original Bottle interface is now replaced.
// The original Product interface is kept but might need review
// based on how it's used elsewhere, given the overlap and differences
// with the new Bottle interface.
