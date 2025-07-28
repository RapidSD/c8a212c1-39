'use client';

import type {
  Cart,
  Product,
  ProductVariant
} from '@/lib/shopify/types';
import { 
  getCart,
  addToCart,
  updateCartLine,
  removeFromCart
} from '@/lib/shopify/cart-client';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';

type UpdateType = 'plus' | 'minus' | 'delete';

type CartContextType = {
  cart: Cart | null;
  isLoading: boolean;
  addCartItem: (variant: ProductVariant, product: Product) => Promise<void>;
  updateCartItem: (merchandiseId: string, updateType: UpdateType) => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function createEmptyCart(): Cart {
  return {
    id: undefined,
    checkoutUrl: '',
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: '0', currencyCode: 'USD' },
      totalAmount: { amount: '0', currencyCode: 'USD' },
      totalTaxAmount: { amount: '0', currencyCode: 'USD' }
    }
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        console.log('🔄 Loading cart...');
        const loadedCart = await getCart();
        setCart(loadedCart || createEmptyCart());
        console.log('✅ Cart loaded');
      } catch (error) {
        console.error('❌ Error loading cart:', error);
        setCart(createEmptyCart());
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  const refreshCart = async () => {
    try {
      console.log('🔄 Refreshing cart...');
      const freshCart = await getCart();
      setCart(freshCart || createEmptyCart());
    } catch (error) {
      console.error('❌ Error refreshing cart:', error);
    }
  };

  const addCartItem = async (variant: ProductVariant, product: Product) => {
    try {
      console.log('➕ Adding item to cart:', { 
        variantId: variant.id, 
        productTitle: product.title 
      });
      
      setIsLoading(true);
      const updatedCart = await addToCart(variant.id, 1);
      setCart(updatedCart);
      console.log('✅ Item added successfully');
    } catch (error) {
      console.error('❌ Error adding item to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (merchandiseId: string, updateType: UpdateType) => {
    if (!cart) return;

    try {
      console.log('🔄 Updating cart item:', { merchandiseId, updateType });
      setIsLoading(true);

      const cartLine = cart.lines.find(line => line.merchandise.id === merchandiseId);
      if (!cartLine || !cartLine.id) {
        console.error('Cart line not found or missing ID');
        return;
      }

      let updatedCart: Cart;

      switch (updateType) {
        case 'plus':
          updatedCart = await updateCartLine(cartLine.id, cartLine.quantity + 1);
          break;
        case 'minus':
          if (cartLine.quantity <= 1) {
            updatedCart = await removeFromCart([cartLine.id]);
          } else {
            updatedCart = await updateCartLine(cartLine.id, cartLine.quantity - 1);
          }
          break;
        case 'delete':
          updatedCart = await removeFromCart([cartLine.id]);
          break;
        default:
          return;
      }

      setCart(updatedCart);
      console.log('✅ Cart item updated successfully');
    } catch (error) {
      console.error('❌ Error updating cart item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addCartItem,
        updateCartItem,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
