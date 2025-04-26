
import { create } from 'zustand';
import { toast } from "sonner";
import type { Bottle } from '@/types/bottle';
import type { BobState, TasteProfile } from './types';

const BAXUS_API_URL = 'https://services.baxus.co/api/bar/user';

// Mock data to use when API is unavailable
const MOCK_BOTTLE_DATA: Bottle[] = [
  {
    id: 1,
    bar_id: 101,
    fill_percentage: 100,
    note: null,
    created_at: "2025-01-15T12:00:00Z",
    updated_at: "2025-01-15T12:00:00Z",
    added: "2025-01-15T12:00:00Z",
    user: { user_name: "demo_user" },
    product: {
      id: 201,
      name: "Lagavulin 16",
      image_url: "https://images.whiskybase.com/whiskies/21816.jpg",
      brand_id: 301,
      brand: "Lagavulin",
      spirit: "Scotch",
      size: "750ml",
      proof: 86,
      average_msrp: 89.99,
      fair_price: 85.99,
      shelf_price: 95.99,
      popularity: 92,
      barrel_pick: false,
      verified_date: "2024-12-01T00:00:00Z",
    }
  },
  {
    id: 2,
    bar_id: 102,
    fill_percentage: 75,
    note: "Favorite bourbon",
    created_at: "2025-02-20T14:30:00Z",
    updated_at: "2025-02-20T14:30:00Z",
    added: "2025-02-20T14:30:00Z",
    user: { user_name: "demo_user" },
    product: {
      id: 202,
      name: "Buffalo Trace",
      image_url: "https://www.buffalotracedistillery.com/content/dam/buffalotrace/products/Buffalo-Trace-Product-Bottle.png",
      brand_id: 302,
      brand: "Buffalo Trace",
      spirit: "Bourbon",
      size: "750ml",
      proof: 90,
      average_msrp: 29.99,
      fair_price: 25.99,
      shelf_price: 35.99,
      popularity: 88,
      barrel_pick: false,
      verified_date: "2024-12-02T00:00:00Z",
    }
  },
  {
    id: 3,
    bar_id: 103,
    fill_percentage: 90,
    note: "Special occasion",
    created_at: "2025-03-10T09:15:00Z",
    updated_at: "2025-03-10T09:15:00Z",
    added: "2025-03-10T09:15:00Z",
    user: { user_name: "demo_user" },
    product: {
      id: 203,
      name: "Hibiki Harmony",
      image_url: "https://www.suntory.com/products/hibiki/img/sp/harmony/img_bottle.png",
      brand_id: 303,
      brand: "Suntory",
      spirit: "Japanese Whisky",
      size: "750ml",
      proof: 86,
      average_msrp: 89.99,
      fair_price: 85.99,
      shelf_price: 110.99,
      popularity: 95,
      barrel_pick: false,
      verified_date: "2024-12-03T00:00:00Z",
    }
  }
];

const calculateTasteProfile = (collection: Bottle[]): TasteProfile => {
  // Count regions
  const regionCounts: Record<string, number> = {};
  collection.forEach(bottle => {
    const spirit = bottle.product.spirit;
    regionCounts[spirit] = (regionCounts[spirit] || 0) + 1;
  });
  
  const regions = Object.entries(regionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  // Calculate average price
  const avgPrice = collection.reduce((sum, bottle) => sum + (bottle.product.average_msrp || 0), 0) / collection.length;
  
  // Calculate preferences based on proof ranges
  const proofs = collection.map(bottle => bottle.product.proof).filter(Boolean);
  const agePreference = {
    min: Math.min(...proofs) || 0,
    max: Math.max(...proofs) || 0,
    avg: proofs.reduce((sum, proof) => sum + proof, 0) / proofs.length || 0
  };
  
  // Count styles (using spirits as styles)
  const styleCounts: Record<string, number> = {};
  collection.forEach(bottle => {
    const spirit = bottle.product.spirit;
    styleCounts[spirit] = (styleCounts[spirit] || 0) + 1;
  });
  
  const styles = Object.entries(styleCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  return {
    regions,
    averagePrice: avgPrice,
    agePreference,
    styles
  };
};

const generateRecommendations = (collection: Bottle[]): (Bottle & { rationale: string })[] => {
  if (!collection.length) return [];
  
  // Group bottles by spirit
  const spiritGroups = collection.reduce((acc, bottle) => {
    const spirit = bottle.product.spirit;
    if (!acc[spirit]) acc[spirit] = [];
    acc[spirit].push(bottle);
    return acc;
  }, {} as Record<string, Bottle[]>);
  
  // Get average price point
  const avgPrice = collection.reduce((sum, b) => sum + (b.product.average_msrp || 0), 0) / collection.length;
  
  // Find most common spirits
  const spiritCounts = Object.entries(spiritGroups)
    .map(([spirit, bottles]) => ({ spirit, count: bottles.length }))
    .sort((a, b) => b.count - a.count);
  
  const favoriteSpirit = spiritCounts[0]?.spirit || 'Whiskey';
  
  // Filter collection to find potential recommendations
  return collection.slice(0, 5).map(bottle => ({
    ...bottle,
    rationale: `Based on your collection of ${favoriteSpirit}s with an average price of $${Math.round(avgPrice)}, this ${bottle.product.spirit} would be an excellent addition.`
  }));
};

export const useBobStore = create<BobState>((set, get) => ({
  username: '',
  isLoading: false,
  collection: [],
  recommendations: [],
  wishlist: [],
  tasteProfile: null,
  
  setUsername: (username) => set({ username }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  fetchUserData: async (username: string) => {
    set({ isLoading: true });
    
    try {
      console.log(`Fetching data from: ${BAXUS_API_URL}/${username}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${BAXUS_API_URL}/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch collection data: ${response.status} ${response.statusText}`);
      }
      
      const collection: Bottle[] = await response.json();
      console.log('Collection data received:', collection);
      
      // Generate recommendations from the collection
      const recommendations = generateRecommendations(collection);
      
      // Calculate taste profile
      const tasteProfile = calculateTasteProfile(collection);
      
      set({
        collection,
        recommendations,
        wishlist: [], // Reset wishlist when fetching new data
        tasteProfile,
        isLoading: false
      });
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // Use mock data as fallback
      console.log('Using mock data as fallback');
      const collection = MOCK_BOTTLE_DATA;
      const recommendations = generateRecommendations(collection);
      const tasteProfile = calculateTasteProfile(collection);
      
      set({
        collection,
        recommendations,
        wishlist: [],
        tasteProfile,
        isLoading: false
      });
      
      toast.info('Demo mode: Using sample data');
    }
  },
  
  toggleWishlist: (bottleId: number) => {
    set((state) => {
      const isInWishlist = state.wishlist.some(b => b.id === bottleId);
      
      // Find the bottle in either collection or recommendations
      const bottle = 
        state.collection.find(b => b.id === bottleId) ||
        state.recommendations.find(b => b.id === bottleId);
      
      if (!bottle) {
        toast.error('Bottle not found');
        return state;
      }
      
      // Update wishlist
      const updatedWishlist = isInWishlist
        ? state.wishlist.filter(b => b.id !== bottleId)
        : [...state.wishlist, bottle];
      
      // Show appropriate toast
      if (isInWishlist) {
        toast.info('Removed from your wishlist');
      } else {
        toast.success('Added to your wishlist');
      }
      
      return { wishlist: updatedWishlist };
    });
  },
  
  getCollectionStats: () => {
    const { collection } = get();
    return calculateTasteProfile(collection);
  }
}));
