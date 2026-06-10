export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export type VinylFormat = 'LP' | 'EP' | 'Single';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  artist: string;
  description: string;
  price: number;
  stock: number;
  genre: string;
  year: number | null;
  label: string;
  format: VinylFormat;
  image_url: string;
  category_id: string;
  category_name: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
}

export interface CartItem {
  product_id: string;
  name: string;
  artist: string;
  price: number;
  quantity: number;
  image_url: string;
  line_total: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  item_count: number;
  updated_at: string;
}

export type OrderStatus =
  | 'pedido'
  | 'cargado'
  | 'entregado'
  | 'cancelado'
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface StatusHistoryEntry {
  status: OrderStatus;
  changed_at: string;
  note: string;
}

export interface ShippingAddress {
  full_name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface OrderItem {
  product_id: string;
  name: string;
  artist: string;
  price: number;
  quantity: number;
  image_url: string;
  line_total: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  status_history: StatusHistoryEntry[];
  shipping_address: ShippingAddress;
  payment_reference: string;
  created_at: string;
  updated_at: string;
}

export interface AdminOrder extends Order {
  user_id: string;
  customer_name: string;
  customer_email: string;
}

export interface ProductCreatePayload {
  name: string;
  slug: string;
  sku: string;
  artist: string;
  description: string;
  price: number;
  stock: number;
  genre: string;
  year: number | null;
  label: string;
  format: VinylFormat;
  image_url: string;
  category_id: string;
}

export interface ProductUpdatePayload extends Partial<ProductCreatePayload> {
  is_active?: boolean;
}

export interface ApiError {
  detail: string | { msg: string }[];
}
