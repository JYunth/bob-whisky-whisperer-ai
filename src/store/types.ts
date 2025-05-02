
import type { Bottle } from '@/types/bottle';

export type TasteProfile = {
  regions: {name: string, value: number}[];
  averagePrice: number;
  agePreference: {min: number, max: number, avg: number};
  styles: {name: string, value: number}[];
};

export type RecommendationType = 'general' | 'similarPrice' | 'similarProfile' | 'complementary';

export type RecommendationParams = {
  minPrice?: number;
  maxPrice?: number;
  profileFocus?: string;
};

export type BobState = {
  username: string;
  isLoading: boolean;
  collection: Bottle[];
  // Renamed from recommendations
  generalRecommendations: (Bottle & { rationale?: string })[];
  // New recommendation types
  similarPriceRecommendations: (Bottle & { rationale?: string })[];
  similarProfileRecommendations: (Bottle & { rationale?: string })[];
  complementaryRecommendations: (Bottle & { rationale?: string })[];
  // Active recommendation type and params
  activeRecommendationType: RecommendationType;
  recommendationParams: RecommendationParams;

  wishlist: Bottle[];
  tasteProfile: TasteProfile | null;

  // Actions
  setUsername: (username: string) => void;
  setLoading: (loading: boolean) => void;
  setActiveRecommendationType: (type: RecommendationType) => void; // Add the new action signature
  fetchUserData: (username: string) => Promise<void>; // Fetches collection + general recommendations
  // New fetch actions
  fetchSimilarPriceRecommendations: (username: string, minPrice?: number, maxPrice?: number) => Promise<void>;
  fetchSimilarProfileRecommendations: (username: string, focus?: string) => Promise<void>;
  fetchComplementaryRecommendations: (username: string) => Promise<void>;
fetchWishlist: (username: string) => Promise<void>; // Add wishlist fetch action signature
  toggleWishlist: (bottleId: number) => void;
  getCollectionStats: () => TasteProfile;
};
