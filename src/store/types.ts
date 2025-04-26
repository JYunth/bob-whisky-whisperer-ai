
import type { Bottle } from '@/types/bottle';

export type TasteProfile = {
  regions: {name: string, value: number}[];
  averagePrice: number;
  agePreference: {min: number, max: number, avg: number};
  styles: {name: string, value: number}[];
};

export type BobState = {
  username: string;
  isLoading: boolean;
  collection: Bottle[];
  recommendations: (Bottle & { rationale: string })[];
  wishlist: Bottle[];
  tasteProfile: TasteProfile | null;
  
  // Actions
  setUsername: (username: string) => void;
  setLoading: (loading: boolean) => void;
  fetchUserData: (username: string) => Promise<void>;
  toggleWishlist: (bottleId: number) => void;
  getCollectionStats: () => TasteProfile;
};
