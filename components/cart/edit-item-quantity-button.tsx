'use client';

import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useCart } from './cart-context';
import type { CartItem } from '@/lib/shopify/types';
import { useState } from 'react';

export type UpdateType = 'plus' | 'minus';

export function EditItemQuantityButton({
  item,
  type,
  optimisticUpdate
}: {
  item: CartItem;
  type: UpdateType;
  optimisticUpdate: (merchandiseId: string, updateType: UpdateType) => void;
}) {
  const { updateCartItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      optimisticUpdate(item.merchandise.id, type);
      await updateCartItem(item.merchandise.id, type);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={type === 'plus' ? 'Increase item quantity' : 'Reduce item quantity'}
      disabled={isUpdating}
      className={clsx(
        'ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full px-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80',
        {
          'cursor-not-allowed': isUpdating,
          'ml-auto': type === 'minus'
        }
      )}
    >
      {type === 'plus' ? (
        <PlusIcon className="h-4 w-4 dark:text-neutral-500" />
      ) : (
        <MinusIcon className="h-4 w-4 dark:text-neutral-500" />
      )}
    </button>
  );
}
