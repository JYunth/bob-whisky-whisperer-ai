
import { create } from 'zustand';
import { toast } from "sonner";

// Types
export type WhiskyBottle = {
  id: string;
  name: string;
  distillery: string;
  region: string;
  age?: number;
  price: number;
  image: string;
  tags: string[];
  inWishlist: boolean;
}

export type TasteProfile = {
  regions: {name: string, value: number}[];
  averagePrice: number;
  agePreference: {min: number, max: number, avg: number};
  styles: {name: string, value: number}[];
}

type BobState = {
  username: string;
  isLoading: boolean;
  collection: WhiskyBottle[];
  recommendations: (WhiskyBottle & { rationale: string })[];
  wishlist: WhiskyBottle[];
  tasteProfile: TasteProfile | null;
  
  // Actions
  setUsername: (username: string) => void;
  setLoading: (loading: boolean) => void;
  fetchUserData: (username: string) => Promise<void>;
  toggleWishlist: (bottleId: string) => void;
  getCollectionStats: () => TasteProfile;
};

// Mock data generator (simulating API)
const generateMockCollection = (username: string): WhiskyBottle[] => {
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
  const collection: WhiskyBottle[] = [];
  
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
      id: `bottle-${i}`,
      name: `${distillery} ${age ? age + 'yr' : 'Special Reserve'}`,
      distillery,
      region,
      age,
      price,
      image: `/placeholder.svg`,
      tags: [region, ...bottleStyles],
      inWishlist: Math.random() > 0.8 // About 20% in wishlist initially
    });
  }
  
  return collection;
};

const generateRecommendations = (collection: WhiskyBottle[]): (WhiskyBottle & { rationale: string })[] => {
  // Use similar logic to collection generation, but make them different bottles
  const recommendations: (WhiskyBottle & { rationale: string })[] = [];
  
  // Analyze collection for preferences
  const regions = collection.map(b => b.region);
  const mostCommonRegion = regions.sort((a, b) => 
    regions.filter(r => r === a).length - regions.filter(r => r === b).length
  ).pop() || 'Speyside';
  
  const allTags = collection.flatMap(b => b.tags);
  const uniqueTags = [...new Set(allTags)];
  const tagFrequency = uniqueTags.map(tag => ({
    tag,
    count: allTags.filter(t => t === tag).length
  })).sort((a, b) => b.count - a.count);
  
  const favoriteStyle = tagFrequency[0]?.tag || 'Fruity';
  const secondStyle = tagFrequency[1]?.tag || 'Smooth';
  
  const avgPrice = collection.reduce((sum, b) => sum + b.price, 0) / collection.length;
  
  // Generate 5 recommendations
  const recBottles = [
    {
      id: `rec-1`,
      name: `Dalmore 15yr`,
      distillery: 'Dalmore',
      region: 'Highland',
      age: 15,
      price: Math.round(avgPrice * 1.2),
      image: `/placeholder.svg`,
      tags: ['Highland', 'Rich', 'Spicy'],
      inWishlist: false,
      rationale: `Based on your collection, you seem to appreciate quality Highland malts. Dalmore's rich character and complexity would be a perfect addition to your bar.`
    },
    {
      id: `rec-2`,
      name: `Lagavulin 16yr`,
      distillery: 'Lagavulin',
      region: 'Islay',
      age: 16,
      price: 95,
      image: `/placeholder.svg`,
      tags: ['Islay', 'Smoky', 'Peaty'],
      inWishlist: false,
      rationale: `Your collection shows you enjoy ${favoriteStyle} profiles. If you want to explore something different, Lagavulin offers a perfectly balanced peaty experience.`
    },
    {
      id: `rec-3`,
      name: `Balvenie DoubleWood 12yr`,
      distillery: 'Balvenie',
      region: 'Speyside',
      age: 12,
      price: 65,
      image: `/placeholder.svg`,
      tags: ['Speyside', 'Honey', 'Smooth'],
      inWishlist: false,
      rationale: `The Balvenie DoubleWood would complement your ${mostCommonRegion} bottles, adding a honeyed dimension with its unique double cask maturation.`
    },
    {
      id: `rec-4`,
      name: `Hibiki Harmony`,
      distillery: 'Suntory',
      region: 'Japanese',
      price: 110,
      image: `/placeholder.svg`,
      tags: ['Japanese', 'Floral', 'Elegant'],
      inWishlist: false,
      rationale: `Your preference for ${secondStyle} whiskies suggests you'd appreciate Hibiki's refined, elegant character and floral notes.`
    },
    {
      id: `rec-5`,
      name: `GlenDronach 18yr Allardice`,
      distillery: 'GlenDronach',
      region: 'Highland',
      age: 18,
      price: 180,
      image: `/placeholder.svg`,
      tags: ['Highland', 'Sherry', 'Rich'],
      inWishlist: false,
      rationale: `Given your collection's average price point of $${Math.round(avgPrice)}, this premium sherry-matured Highland malt would be a worthy special occasion bottle.`
    }
  ];
  
  return recBottles;
};

// Calculate taste profile from collection
const calculateTasteProfile = (collection: WhiskyBottle[]): TasteProfile => {
  // Count regions
  const regionCounts: Record<string, number> = {};
  collection.forEach(bottle => {
    regionCounts[bottle.region] = (regionCounts[bottle.region] || 0) + 1;
  });
  
  const regions = Object.entries(regionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  // Calculate average price
  const avgPrice = collection.reduce((sum, bottle) => sum + bottle.price, 0) / collection.length;
  
  // Find age preference
  const ages = collection
    .filter(bottle => bottle.age !== undefined)
    .map(bottle => bottle.age as number);
  
  const agePreference = {
    min: ages.length ? Math.min(...ages) : 0,
    max: ages.length ? Math.max(...ages) : 0,
    avg: ages.length ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0
  };
  
  // Count styles (from tags excluding regions)
  const styleCounts: Record<string, number> = {};
  collection.forEach(bottle => {
    bottle.tags
      .filter(tag => tag !== bottle.region)
      .forEach(style => {
        styleCounts[style] = (styleCounts[style] || 0) + 1;
      });
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
      const mockWishlist = mockCollection.filter(bottle => bottle.inWishlist);
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
          ? { ...bottle, inWishlist: !bottle.inWishlist } 
          : bottle
      );
      
      // Update in recommendations
      const updatedRecommendations = state.recommendations.map(bottle => 
        bottle.id === bottleId 
          ? { ...bottle, inWishlist: !bottle.inWishlist } 
          : bottle
      );
      
      // Recalculate wishlist
      const updatedWishlist = [
        ...updatedCollection.filter(bottle => bottle.inWishlist),
        ...updatedRecommendations.filter(bottle => bottle.inWishlist)
      ];
      
      const inWishlist = updatedCollection.find(b => b.id === bottleId)?.inWishlist || 
                        updatedRecommendations.find(b => b.id === bottleId)?.inWishlist;
      
      if (inWishlist) {
        toast.success('Added to your wishlist');
      } else {
        toast.info('Removed from your wishlist');
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
