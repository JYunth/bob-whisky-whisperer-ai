
export interface User {
  user_name: string;
}

export interface Product {
  id: number;
  name: string;
  image_url: string;
  brand_id: number;
  brand: string;
  spirit: string;
  size: string;
  proof: number;
  average_msrp: number;
  fair_price: number;
  shelf_price: number;
  popularity: number;
  barrel_pick: boolean;
  verified_date: string;
}

export interface Bottle {
  id: number;
  bar_id: number;
  fill_percentage: number;
  note: string | null;
  created_at: string;
  updated_at: string;
  added: string;
  user: User;
  product: Product;
}
