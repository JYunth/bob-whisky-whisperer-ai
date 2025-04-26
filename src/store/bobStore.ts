import { create } from 'zustand';
import { toast } from "sonner";
import type { Bottle } from '@/types/bottle';
import type { BobState, TasteProfile } from './types';

// Mock data generator (simulating API)
const generateMockCollection = (username: string): Bottle[] => {
  const regions = ['Speyside', 'Islay', 'Highland', 'Lowland', 'Campbeltown', 'Islands', 'Japanese', 'Bourbon'];
  const styles = ['Fruity', 'Smoky', 'Rich', 'Spicy', 'Floral', 'Light', 'Sweet', 'Peaty'];
  const distilleries = {
    'Speyside': ['Glenfiddich', 'Macallan', 'Glenlivet', 'Balvenie'],
    'Islay': ['Laphroaig', 'Ardbeg', 'Lagavulin', 'Bruichladdich'],
    'Highland': ['Glenmorangie', 'Dalmore', 'Oban', 'Glendronach'],
    'Japanese': ['Yamazaki', 'Nikka', 'Hibiki', 'Hakushu'],
    'Bourbon': ['Buffalo Trace', 'Maker\'s Mark', 'Woodford Reserve', 'Four Roses']
  };
  
  // Generate between 5-12 bottles
  const bottleCount = 5 + Math.floor(Math.random() * 8);
  const collection: Bottle[] = [];
  
  for (let i = 0; i < bottleCount; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const distilleryList = distilleries[region as keyof typeof distilleries] || 
      ['Generic Distillery 1', 'Generic Distillery 2'];
    
    const distillery = distilleryList[Math.floor(Math.random() * distilleryList.length)];
    const age = Math.random() > 0.3 ? Math.floor(Math.random() * 25) + 5 : undefined;
    const price = Math.floor(Math.random() * 200) + 30;
    
    // Generate 1-3 random styles
    const bottleStyles = [];
    const stylesCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < stylesCount; j++) {
      const style = styles[Math.floor(Math.random() * styles.length)];
      if (!bottleStyles.includes(style)) {
        bottleStyles.push(style);
      }
    }
    
    collection.push({
      id: i,
      bar_id: 123,
      fill_percentage: 90,
      note: "tasty",
      created_at: "date",
      updated_at: "date",
      added: "date",
      user: {user_name: username},
      product: {
        id: i,
        name: `${distillery} ${age ? age + 'yr' : 'Special Reserve'}`,
        image_url: `/placeholder.svg`,
        brand_id: 1,
        brand: distillery,
        spirit: region,
        size: "750ml",
        proof: 40,
        average_msrp: price,
        fair_price: price,
        shelf_price: price,
        popularity: 7,
        barrel_pick: false,
        verified_date: "date"
      }
    });
  }
  
  return collection;
};

const generateRecommendations = (collection: Bottle[]): (Bottle & { rationale: string })[] => {
  // Use similar logic to collection generation, but make them different bottles
  const recommendations: (Bottle & { rationale: string })[] = [];
  
  // Analyze collection for preferences
  const regions = collection.map(b => b.product.spirit);
  const mostCommonRegion = regions.sort((a, b) => 
    regions.filter(r => r === a).length - regions.filter(r => r === b).length
  ).pop() || 'Speyside';
  
  const allTags = collection.flatMap(b => b.product.spirit);
  const uniqueTags = [...new Set(allTags)];
  const tagFrequency = uniqueTags.map(tag => ({
    tag,
    count: allTags.filter(t => t === tag).length
  })).sort((a, b) => b.count - a.count);
  
  const favoriteStyle = tagFrequency[0]?.tag || 'Fruity';
  const secondStyle = tagFrequency[1]?.tag || 'Smooth';
  
  const avgPrice = collection.reduce((sum, b) => sum + b.product.average_msrp, 0) / collection.length;
  
  // Generate 5 recommendations
  const recBottles = [
    {
      id: 6,
      bar_id: 123,
      fill_percentage: 90,
      note: "tasty",
      created_at: "date",
      updated_at: "date",
      added: "date",
      user: {user_name: "test"},
      product: {
        id: 6,
        name: `Dalmore 15yr`,
        image_url: `/placeholder.svg`,
        brand_id: 1,
        brand: 'Dalmore',
        spirit: 'Highland',
        size: "750ml",
        proof: 40,
        average_msrp: Math.round(avgPrice * 1.2),
        fair_price: 100,
        shelf_price: 100,
        popularity: 7,
        barrel_pick: false,
        verified_date: "date"
      },
      rationale: `Based on your collection, you seem to appreciate quality Highland malts. Dalmore's rich character and complexity would be a perfect addition to your bar.`
    },
    {
      id: 7,
      bar_id: 123,
      fill_percentage: 90,
      note: "tasty",
      created_at: "date",
      updated_at: "date",
      added: "date",
      user: {user_name: "test"},
      product: {
        id: 7,
        name: `Lagavulin 16yr`,
        image_url: `/placeholder.svg`,
        brand_id: 1,
        brand: 'Lagavulin',
        spirit: 'Islay',
        size: "750ml",
        proof: 40,
        average_msrp: 95,
        fair_price: 100,
        shelf_price: 100,
        popularity: 7,
        barrel_pick: false,
        verified_date: "date"
      },
      rationale: `Your collection shows you enjoy ${favoriteStyle} profiles. If you want to explore something different, Lagavulin offers a perfectly balanced peaty experience.`
    },
    {
      id: 8,
      bar_id: 123,
      fill_percentage: 90,
      note: "tasty",
      created_at: "date",
      updated_at: "date",
      added: "date",
      user: {user_name: "test"},
      product: {
        id: 8,
        name: `Balvenie DoubleWood 12yr`,
        image_url: `/placeholder.svg`,
        brand_id: 1,
        brand: 'Balvenie',
        spirit: 'Speyside',
        size: "750ml",
        proof: 40,
        average_msrp: 65,
        fair_price: 100,
        shelf_price: 100,
        popularity: 7,
        barrel_pick: false,
        verified_date: "date"
      },
      rationale: `The Balvenie DoubleWood would complement your ${mostCommonRegion} bottles, adding a honeyed dimension with its unique double cask maturation.`
    },
    {
      id: 9,
      bar_id: 123,
      fill_percentage: 90,
      note: "tasty",
      created_at: "date",
      updated_at: "date",
      added: "date",
      user: {user_name: "test"},
      product: {
        id: 9,
        name: `Hibiki Harmony`,
        image_url: `/placeholder.svg`,
        brand_id: 1,
        brand: 'Suntory',
        spirit: 'Japanese',
        size: "750ml",
        proof: 40,
        average_msrp: 110,
        fair_price: 100,
        shelf_price: 100,
        popularity: 7,
        barrel_pick: false,
        verified_date: "date"
      },
      rationale: `Your preference for ${secondStyle} whiskies suggests you'd appreciate Hibiki's refined, elegant character and floral notes.`
    },
    {
      id: 10,
      bar_id: 123,
      fill_percentage: 90,
      note: "tasty",
      created_at: "date",
      updated_at: "date",
      added: "date",
      user: {user_name: "test"},
      product: {
        id: 10,
        name: `GlenDronach 18yr Allardice`,
        image_url: `/placeholder.svg`,
        brand_id: 1,
        brand: 'GlenDronach',
        spirit: 'Highland',
        size: "750ml",
        proof: 40,
        average_msrp: 180,
        fair_price: 100,
        shelf_price: 100,
        popularity: 7,
        barrel_pick: false,
        verified_date: "date"
      },
      rationale: `Given your collection's average price point of $${Math.round(avgPrice)}, this premium sherry-matured Highland malt would be a worthy special occasion bottle.`
    }
  ];
  
  return recBottles;
};

// Calculate taste profile from collection
const calculateTasteProfile = (collection: Bottle[]): TasteProfile => {
  // Count regions
  const regionCounts: Record<string, number> = {};
  collection.forEach(bottle => {
    regionCounts[bottle.product.spirit] = (regionCounts[bottle.product.spirit] || 0) + 1;
  });
  
  const regions = Object.entries(regionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  // Calculate average price
  const avgPrice = collection.reduce((sum, bottle) => sum + (bottle.product.average_msrp || 0), 0) / collection.length;
  
  // Find age preference (we don't have age in the new schema, using proof as a substitute)
  const proofs = collection.map(bottle => bottle.product.proof);
  
  const agePreference = {
    min: proofs.length ? Math.min(...proofs) : 0,
    max: proofs.length ? Math.max(...proofs) : 0,
    avg: proofs.length ? proofs.reduce((sum, proof) => sum + proof, 0) / proofs.length : 0
  };
  
  // Count styles (we don't have styles in the new schema, using spirits)
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

// Define the store
export const useBobStore = create<BobState>((set, get) => ({
  username: '',
  isLoading: false,
  collection: [],
  recommendations: [],
  wishlist: [],
  tasteProfile: null,
  
  setUsername: (username) => set({ username }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  fetchUserData: async (username) => {
    set({ isLoading: true });
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate mock data
      const mockCollection = generateMockCollection(username);
      const mockRecommendations = generateRecommendations(mockCollection);
      const mockWishlist = mockCollection.filter(bottle => bottle.id % 4 === 0); // Mock wishlist
      const tasteProfile = calculateTasteProfile(mockCollection);
      
      set({
        collection: mockCollection,
        recommendations: mockRecommendations,
        wishlist: mockWishlist,
        tasteProfile,
        isLoading: false
      });
      
      return;
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load your data. Please try again.');
      set({ isLoading: false });
    }
  },
  
  toggleWishlist: (bottleId) => {
    set((state) => {
      // Update in collection
      const updatedCollection = state.collection.map(bottle => 
        bottle.id === bottleId 
          ? { ...bottle } 
          : bottle
      );
      
      // Update in recommendations
      const updatedRecommendations = state.recommendations.map(bottle => 
        bottle.id === bottleId 
          ? { ...bottle } 
          : bottle
      );
      
      // Check if bottle is already in wishlist
      const isInWishlist = state.wishlist.some(b => b.id === bottleId);
      
      // Update wishlist
      let updatedWishlist: Bottle[];
      if (isInWishlist) {
        // Remove from wishlist
        updatedWishlist = state.wishlist.filter(b => b.id !== bottleId);
        toast.info('Removed from your wishlist');
      } else {
        // Add to wishlist
        const bottleToAdd = 
          state.collection.find(b => b.id === bottleId) || 
          state.recommendations.find(b => b.id === bottleId);
          
        if (bottleToAdd) {
          updatedWishlist = [...state.wishlist, bottleToAdd];
          toast.success('Added to your wishlist');
        } else {
          updatedWishlist = [...state.wishlist];
          toast.error('Bottle not found');
        }
      }
      
      return {
        collection: updatedCollection,
        recommendations: updatedRecommendations,
        wishlist: updatedWishlist
      };
    });
  },
  
  getCollectionStats: () => {
    const { collection } = get();
    return calculateTasteProfile(collection);
  }
}));
