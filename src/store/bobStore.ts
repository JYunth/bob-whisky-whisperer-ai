import { create } from 'zustand';
import { toast } from "sonner";
import type { Bottle } from '@/types/bottle';
import type { BobState, TasteProfile } from './types';

const BAXUS_API_URL = 'https://services.baxus.co/api/bar/user';

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
      const response = await fetch(`${BAXUS_API_URL}/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      
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
      toast.error('Failed to load your collection. Please try again.');
      set({ isLoading: false });
      throw error;
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
