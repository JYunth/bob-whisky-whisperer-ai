import { create } from 'zustand';
import { toast } from "sonner";
import type { Bottle } from '@/types/bottle';
// Import RecommendationParams here
import type { BobState, TasteProfile, RecommendationParams, RecommendationType } from './types'; // Import RecommendationType

const BAXUS_API_URL = 'https://bob0.jyunth28.workers.dev'; // Use proxy worker URL
const RECOMMENDATION_API_URL = 'http://localhost:3000/api'; // New API URL for recommendations

// Mock data (remains the same)
const MOCK_BOTTLE_DATA: Bottle[] = [
  {
    id: 519,
    name: "Pappy Van Winkle 23 Year Family Reserve",
    size: "750",
    proof: 95.6,
    abv: 47.8,
    spirit_type: "Bourbon",
    brand_id: 370,
    popularity: 100046,
    image_url: "https://d1w35me0y6a2bb.cloudfront.net/newproducts/reccmI7Umn58SrhlY",
    avg_msrp: 321.64,
    fair_price: 958.61,
    shelf_price: 4899.97,
    total_score: 5689,
    wishlist_count: 2453,
    vote_count: 2982,
    bar_count: 254,
    ranking: 64,
    brand: "Old Rip Van Winkle Distillery",
    description: "An exceptionally rare and sought-after bourbon with rich oak, caramel, and vanilla notes.",
    msrp: 300,
    spirit_profile: { Sweet: 4, Floral: 2, Woody: 5, Spicy: 3, Smoky: 1, Fruity: 4, Smooth: 5 }
  },
  {
    id: 13266,
    name: "Heaven Hill Bottled In Bond 7 Year",
    size: "750",
    proof: 100,
    abv: 50,
    spirit_type: "Bourbon",
    brand_id: 430,
    popularity: 100144,
    image_url: "https://d1w35me0y6a2bb.cloudfront.net/newproducts/recSJfTSxTvljLvF8",
    avg_msrp: 47.74,
    fair_price: 62.34,
    shelf_price: 84.99,
    total_score: 18850,
    wishlist_count: 1948,
    vote_count: 5366,
    bar_count: 11536,
    ranking: 12,
    brand: "Heaven Hill",
    description: "A balanced and classic bonded bourbon with notes of caramel, oak, and vanilla.",
    msrp: 39.99,
    spirit_profile: { Sweet: 4, Floral: 1, Woody: 3, Spicy: 3, Smoky: 1, Fruity: 2, Smooth: 4 }
  },
  {
    id: 2848,
    name: "Eagle Rare 10 Year",
    size: "750",
    proof: 90,
    abv: 45,
    spirit_type: "Bourbon",
    brand_id: 542,
    popularity: 100519,
    image_url: "https://d1w35me0y6a2bb.cloudfront.net/newproducts/ecce066b-6b3d-4b58-bd04-8bf9c67e3e92",
    avg_msrp: 39.99,
    fair_price: 66.25,
    shelf_price: 49.99,
    total_score: 82217,
    wishlist_count: 8744,
    vote_count: 25989,
    bar_count: 47484,
    ranking: 2,
    brand: "Buffalo Trace",
    description: "A well-balanced bourbon with notes of caramel, vanilla, and oak.",
    msrp: 35,
    spirit_profile: { Sweet: 4, Floral: 2, Woody: 4, Spicy: 3, Smoky: 1, Fruity: 3, Smooth: 5 }
  },
  {
    id: 1522,
    name: "Russell's Reserve 10 Year",
    size: "750",
    proof: 90,
    abv: 45,
    spirit_type: "Bourbon",
    brand_id: 191,
    popularity: 100122,
    image_url: "https://d1w35me0y6a2bb.cloudfront.net/newproducts/7dc9a32b-a17e-4f97-9fed-55a1590dc01e",
    avg_msrp: 45.99,
    fair_price: 56.99,
    shelf_price: 48.74,
    total_score: 12391,
    wishlist_count: 1368,
    vote_count: 3192,
    bar_count: 7831,
    ranking: 21,
    brand: "Russell's Reserve",
    description: "A well-balanced bourbon with notes of oak, vanilla, and spice.",
    msrp: 49.99,
    spirit_profile: { Sweet: 3, Floral: 1, Woody: 4, Spicy: 3, Smoky: 1, Fruity: 3, Smooth: 4 }
  }
];

// Helper functions (remain the same)
const calculateTasteProfile = (collection: Bottle[]): TasteProfile => {
  // Count regions
  const regionCounts: Record<string, number> = {};
  collection.forEach(bottle => {
    const spirit = bottle.spirit_type; // Access directly from bottle
    regionCounts[spirit] = (regionCounts[spirit] || 0) + 1;
  });

  const regions = Object.entries(regionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Calculate average price
  const avgPrice = collection.reduce((sum, bottle) => sum + (bottle.avg_msrp || 0), 0) / collection.length; // Use avg_msrp directly

  // Calculate preferences based on proof ranges
  const proofs = collection.map(bottle => bottle.proof).filter(Boolean); // Access proof directly
  const agePreference = {
    min: Math.min(...proofs) || 0,
    max: Math.max(...proofs) || 0,
    avg: proofs.reduce((sum, proof) => sum + proof, 0) / proofs.length || 0
  };

  // Count styles (using spirits as styles)
  const styleCounts: Record<string, number> = {};
  collection.forEach(bottle => {
    const spirit = bottle.spirit_type; // Access directly from bottle
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

  // Action to explicitly set the active recommendation type
  setActiveRecommendationType: (type: RecommendationType) => set({ activeRecommendationType: type }),

  fetchUserData: async (username: string) => {
    set({ isLoading: true });
    let collectionData: Bottle[] = [];
    let generalRecommendationData: (Bottle & { rationale?: string })[] = [];
    let tasteProfileData: TasteProfile | null = null;

    try {
      // 1. Fetch Collection Data
      try {
        console.log(`Fetching collection data from: ${BAXUS_API_URL}/${username}`);
        const collectionResponse = await fetch(`http://localhost:3000/api/proxy/bar/${username}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000)
        });

        if (!collectionResponse.ok) {
          console.error(`Collection fetch failed: ${collectionResponse.status} ${collectionResponse.statusText}`);
          throw new Error(`Failed to fetch collection: ${collectionResponse.status}`);
        }
        const collectionResult = await collectionResponse.json(); // Get the full response object
        collectionData = collectionResult.recommendations || []; // Extract the recommendations array
        console.log('Collection data received:', collectionData); // Log the actual data

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
fetchWishlist: async (username: string) => {
    if (!username) {
      toast.error("Username is required to fetch wishlist.");
      return;
    }
    // Don't set loading here, let fetchUserData handle overall loading
    // set({ isLoading: true }); 
    const url = `http://localhost:3000/api/proxy/wishlist/${username}`;

    try {
      console.log(`Fetching wishlist from: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        console.error(`Wishlist fetch failed: ${response.status} ${response.statusText}`);
        // Handle 404 specifically - user might not have a wishlist yet
        if (response.status === 404) {
            console.log(`No wishlist found for user ${username}. Setting wishlist to empty array.`);
            set({ wishlist: [] });
            // No toast needed for 404, it's not an error state
        } else {
            throw new Error(`Failed to fetch wishlist: ${response.status}`);
        }
      } else {
        const result = await response.json(); // Get the full response object
        const wishlistData: Bottle[] = result.recommendations || []; // Extract the recommendations array
        console.log('Wishlist data received:', wishlistData); // Log the actual data for better debugging
        set({ wishlist: wishlistData }); // Set the extracted array
        // Optional: Toast on success, maybe too noisy?
        // toast.success(`Successfully fetched ${wishlistData.length} wishlist items.`);
      }

    } catch (error) {
      console.error('Error fetching wishlist:', error);
      // Avoid overwriting wishlist with empty on generic error
      toast.error('Failed to fetch your wishlist.');
    } finally {
      // Don't set loading here either
      // set({ isLoading: false });
    }
  },

})); // End of create<BobState>
