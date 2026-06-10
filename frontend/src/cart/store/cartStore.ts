import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '../../shared/api/client';
import type { Cart, CartItem } from '../../shared/types';
import { useAuthStore } from '../../auth/store/authStore';

interface GuestItem {
  product_id: string;
  name: string;
  artist: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface CartState {
  serverCart: Cart | null;
  guestItems: GuestItem[];
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  fetchCart: () => Promise<void>;
  addItem: (item: Omit<GuestItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncGuestToServer: () => Promise<void>;
}

function calcGuestTotals(items: GuestItem[]) {
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { itemCount, subtotal: Math.round(subtotal * 100) / 100 };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      serverCart: null,
      guestItems: [],
      isLoading: false,
      itemCount: 0,
      subtotal: 0,

      fetchCart: async () => {
        const token = useAuthStore.getState().token;
        if (!token) {
          const totals = calcGuestTotals(get().guestItems);
          set({ ...totals, serverCart: null });
          return;
        }
        set({ isLoading: true });
        try {
          const cart = await apiRequest<Cart>('/cart');
          set({
            serverCart: cart,
            itemCount: cart.item_count,
            subtotal: cart.subtotal,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      addItem: async (item) => {
        const qty = item.quantity ?? 1;
        const token = useAuthStore.getState().token;

        if (!token) {
          const items = [...get().guestItems];
          const existing = items.find((i) => i.product_id === item.product_id);
          if (existing) {
            existing.quantity += qty;
          } else {
            items.push({ ...item, quantity: qty });
          }
          const totals = calcGuestTotals(items);
          set({ guestItems: items, ...totals });
          return;
        }

        set({ isLoading: true });
        try {
          const cart = await apiRequest<Cart>('/cart/items', {
            method: 'POST',
            body: JSON.stringify({ product_id: item.product_id, quantity: qty }),
          });
          set({
            serverCart: cart,
            itemCount: cart.item_count,
            subtotal: cart.subtotal,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateQuantity: async (productId, quantity) => {
        const token = useAuthStore.getState().token;

        if (!token) {
          let items = [...get().guestItems];
          if (quantity <= 0) {
            items = items.filter((i) => i.product_id !== productId);
          } else {
            items = items.map((i) =>
              i.product_id === productId ? { ...i, quantity } : i,
            );
          }
          const totals = calcGuestTotals(items);
          set({ guestItems: items, ...totals });
          return;
        }

        set({ isLoading: true });
        try {
          const cart = await apiRequest<Cart>(`/cart/items/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity }),
          });
          set({
            serverCart: cart,
            itemCount: cart.item_count,
            subtotal: cart.subtotal,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      removeItem: async (productId) => {
        await get().updateQuantity(productId, 0);
      },

      clearCart: async () => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ guestItems: [], itemCount: 0, subtotal: 0, serverCart: null });
          return;
        }
        const cart = await apiRequest<Cart>('/cart', { method: 'DELETE' });
        set({
          serverCart: cart,
          itemCount: cart.item_count,
          subtotal: cart.subtotal,
        });
      },

      syncGuestToServer: async () => {
        const token = useAuthStore.getState().token;
        const guestItems = get().guestItems;
        if (!token || guestItems.length === 0) return;

        for (const item of guestItems) {
          await apiRequest<Cart>('/cart/items', {
            method: 'POST',
            body: JSON.stringify({
              product_id: item.product_id,
              quantity: item.quantity,
            }),
          });
        }
        set({ guestItems: [] });
        await get().fetchCart();
      },
    }),
    {
      name: 'vinyl-cart',
      partialize: (state) => ({ guestItems: state.guestItems }),
    },
  ),
);

export function getDisplayItems(state: CartState): CartItem[] {
  if (state.serverCart) {
    return state.serverCart.items;
  }
  return state.guestItems.map((item) => ({
    ...item,
    line_total: Math.round(item.price * item.quantity * 100) / 100,
  }));
}
