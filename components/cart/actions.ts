'use server';

import { TAGS } from '@/lib/constants';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Note: These server actions are legacy and should be replaced with client-side cart operations
// The cart is now managed client-side using lib/shopify/cart-client.ts

export async function addItem(
  prevState: any,
  selectedVariantId: string | undefined
) {
  console.log('🚀 Server action addItem called:', { selectedVariantId });
  
  // This server action is no longer used with client-side cart
  return 'This action is deprecated. Cart is now managed client-side.';
}

export async function removeItem(prevState: any, lineId: string) {
  console.log('🚀 Server action removeItem called:', { lineId });
  
  // This server action is no longer used with client-side cart
  return 'This action is deprecated. Cart is now managed client-side.';
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    lineId: string;
    variantId: string;
    quantity: number;
  }
) {
  console.log('🚀 Server action updateItemQuantity called:', payload);
  
  // This server action is no longer used with client-side cart
  return 'This action is deprecated. Cart is now managed client-side.';
}

export async function redirectToCheckout() {
  console.log('🚀 Server action redirectToCheckout called');
  
  // This server action is no longer used with client-side cart
  // Checkout is now handled client-side via cart.checkoutUrl
  throw new Error('This action is deprecated. Checkout is now handled client-side.');
}

// Cart is now managed client-side using lib/shopify/cart-client.ts
