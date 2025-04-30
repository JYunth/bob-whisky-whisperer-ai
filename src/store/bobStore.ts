import { create } from 'zustand';
import { toast } from "sonner";
import type { Bottle } from '@/types/bottle';
// Import RecommendationParams here
import type { BobState, TasteProfile, RecommendationParams } from './types';

const BAXUS_API_URL = 'https://bob0.jyunth28.workers.dev'; // Use proxy worker URL
const RECOMMENDATION_API_URL = 'http://localhost:3000/api'; // New API URL for recommendations

// Mock data (remains the same)
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

// Helper functions (remain the same)
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

// generateRecommendations is unused now, can be removed or kept

export const useBobStore = create<BobState>((set, get) => ({
  // Initial State
  username: '',
  isLoading: false,
  collection: [],
  generalRecommendations: [],
  similarPriceRecommendations: [],
  similarProfileRecommendations: [],
  complementaryRecommendations: [],
  activeRecommendationType: 'general',
  recommendationParams: {},
  wishlist: [],
  tasteProfile: null,

  // Actions
  setUsername: (username) => set({ username }),

  setLoading: (loading) => set({ isLoading: loading }),

  fetchUserData: async (username: string) => {
    set({ isLoading: true });
    let collectionData: Bottle[] = [];
    let generalRecommendationData: (Bottle & { rationale?: string })[] = [];
    let tasteProfileData: TasteProfile | null = null;

    try {
      // 1. Fetch Collection Data
      try {
        console.log(`Fetching collection data from: ${BAXUS_API_URL}/${username}`);
        const collectionResponse = await fetch(`${BAXUS_API_URL}/${username}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000)
        });

        if (!collectionResponse.ok) {
          console.error(`Collection fetch failed: ${collectionResponse.status} ${collectionResponse.statusText}`);
          throw new Error(`Failed to fetch collection: ${collectionResponse.status}`);
        }
        collectionData = await collectionResponse.json();
        collectionData = collectionData || [];
        console.log('Collection data received:', collectionData.length);

      } catch (error) {
        console.error('Error fetching collection data:', error);
        toast.error('Failed to fetch your collection. Using sample data instead.');
        collectionData = MOCK_BOTTLE_DATA;
      }

      // 2. Fetch General Recommendations
      if (username) {
          try {
            console.log(`Fetching general recommendations from: ${RECOMMENDATION_API_URL}/user/${username}`);
            const recommendationResponse = await fetch(`${RECOMMENDATION_API_URL}/user/${username}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              signal: AbortSignal.timeout(10000)
            });

            if (!recommendationResponse.ok) {
              console.error(`General Recommendation fetch failed: ${recommendationResponse.status} ${recommendationResponse.statusText}`);
              throw new Error(`Failed to fetch general recommendations: ${recommendationResponse.status}`);
            }
            const recommendationResult = await recommendationResponse.json();
            generalRecommendationData = recommendationResult.recommendations || [];
            console.log('General Recommendations received:', generalRecommendationData.length);

          } catch (error) {
            console.error('Error fetching general recommendations:', error);
            toast.error('Failed to fetch general recommendations from the server.');
            generalRecommendationData = [];
          }
      } else {
          console.log("No username provided, skipping general recommendation fetch.");
          generalRecommendationData = [];
      }

      // 3. Calculate Taste Profile
      if (collectionData && collectionData.length > 0) {
          tasteProfileData = calculateTasteProfile(collectionData);
      } else {
          console.warn("No collection data available to calculate taste profile.");
          tasteProfileData = null;
      }

      // 4. Update state
      set({
        collection: collectionData,
        generalRecommendations: generalRecommendationData,
        tasteProfile: tasteProfileData,
        wishlist: [],
        activeRecommendationType: 'general',
        recommendationParams: {},
        similarPriceRecommendations: [],
        similarProfileRecommendations: [],
        complementaryRecommendations: [],
      });

    } catch (error) {
        console.error('Unexpected error during user data fetch process:', error);
        toast.error('An unexpected error occurred while loading your data.');
        const fallbackCollection = MOCK_BOTTLE_DATA;
        set({
            collection: fallbackCollection,
            generalRecommendations: [],
            tasteProfile: calculateTasteProfile(fallbackCollection),
            wishlist: [],
            activeRecommendationType: 'general',
            recommendationParams: {},
            similarPriceRecommendations: [],
            similarProfileRecommendations: [],
            complementaryRecommendations: [],
        });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: (bottleId: number) => {
    set((state) => {
      const isInWishlist = state.wishlist.some(b => b.id === bottleId);

      const bottle =
        state.collection.find(b => b.id === bottleId) ||
        state.generalRecommendations.find(b => b.id === bottleId) ||
        state.similarPriceRecommendations.find(b => b.id === bottleId) ||
        state.similarProfileRecommendations.find(b => b.id === bottleId) ||
        state.complementaryRecommendations.find(b => b.id === bottleId);

      if (!bottle) {
        toast.error('Bottle not found');
        return state;
      }

      // Corrected logic placement
      const updatedWishlist = isInWishlist
        ? state.wishlist.filter(b => b.id !== bottleId)
        : [...state.wishlist, bottle];

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
    if (!collection || collection.length === 0) {
        return {
            regions: [],
            averagePrice: 0,
            agePreference: { min: 0, max: 0, avg: 0 },
            styles: []
        };
    }
    return calculateTasteProfile(collection);
  },

  // --- NEW FETCH FUNCTIONS (Correctly placed inside the object) ---
  fetchSimilarPriceRecommendations: async (username: string, minPrice?: number, maxPrice?: number) => {
    if (!username) {
      toast.error("Username is required to fetch recommendations.");
      return;
    }
    set({ isLoading: true });
    const params = new URLSearchParams();
    const currentParams: RecommendationParams = {};
    if (minPrice !== undefined) {
      params.append('min_price', String(minPrice));
      currentParams.minPrice = minPrice;
    }
    if (maxPrice !== undefined) {
      params.append('max_price', String(maxPrice));
      currentParams.maxPrice = maxPrice;
    }
    const queryString = params.toString();
    const url = `${RECOMMENDATION_API_URL}/user/${username}/similar-price${queryString ? `?${queryString}` : ''}`;

    try {
      console.log(`Fetching similar price recommendations from: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        console.error(`Similar Price Recommendation fetch failed: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch similar price recommendations: ${response.status}`);
      }
      const result = await response.json();
      const recommendations = result.recommendations || [];
      console.log('Similar Price Recommendations received:', recommendations.length);
      set({
        similarPriceRecommendations: recommendations,
        activeRecommendationType: 'similarPrice',
        recommendationParams: currentParams,
      });
      toast.success(`Found ${recommendations.length} recommendations based on price.`);

    } catch (error) {
      console.error('Error fetching similar price recommendations:', error);
      toast.error('Failed to fetch recommendations based on price.');
      set({
        similarPriceRecommendations: [],
        activeRecommendationType: 'similarPrice',
        recommendationParams: currentParams,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSimilarProfileRecommendations: async (username: string, focus?: string) => {
    if (!username) {
      toast.error("Username is required to fetch recommendations.");
      return;
    }
    set({ isLoading: true });
    const params = new URLSearchParams();
    const currentParams: RecommendationParams = {};
     if (focus) {
      params.append('focus', focus);
      currentParams.profileFocus = focus;
    }
    const queryString = params.toString();
    const url = `${RECOMMENDATION_API_URL}/user/${username}/similar-profile${queryString ? `?${queryString}` : ''}`;

    try {
      console.log(`Fetching similar profile recommendations from: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        console.error(`Similar Profile Recommendation fetch failed: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch similar profile recommendations: ${response.status}`);
      }
      const result = await response.json();
      const recommendations = result.recommendations || [];
      console.log('Similar Profile Recommendations received:', recommendations.length);
      set({
        similarProfileRecommendations: recommendations,
        activeRecommendationType: 'similarProfile',
        recommendationParams: currentParams,
      });
       toast.success(`Found ${recommendations.length} recommendations based on profile${focus ? ` (focus: ${focus})` : ''}.`);

    } catch (error) {
      console.error('Error fetching similar profile recommendations:', error);
      toast.error('Failed to fetch recommendations based on profile.');
      set({
        similarProfileRecommendations: [],
        activeRecommendationType: 'similarProfile',
        recommendationParams: currentParams,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchComplementaryRecommendations: async (username: string) => {
    if (!username) {
      toast.error("Username is required to fetch recommendations.");
      return;
    }
    set({ isLoading: true });
    const url = `${RECOMMENDATION_API_URL}/user/${username}/complementary`;
    const currentParams: RecommendationParams = {};

    try {
      console.log(`Fetching complementary recommendations from: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        console.error(`Complementary Recommendation fetch failed: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch complementary recommendations: ${response.status}`);
      }
      const result = await response.json();
      const recommendations = result.recommendations || [];
      console.log('Complementary Recommendations received:', recommendations.length);
      set({
        complementaryRecommendations: recommendations,
        activeRecommendationType: 'complementary',
        recommendationParams: currentParams,
      });
      toast.success(`Found ${recommendations.length} complementary recommendations.`);

    } catch (error) {
      console.error('Error fetching complementary recommendations:', error);
      toast.error('Failed to fetch complementary recommendations.');
      set({
        complementaryRecommendations: [],
        activeRecommendationType: 'complementary',
        recommendationParams: currentParams,
      });
    } finally {
      set({ isLoading: false });
    }
  },

})); // End of create<BobState>
