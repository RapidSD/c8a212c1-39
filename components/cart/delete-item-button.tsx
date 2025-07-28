'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { removeItem } from '@/components/cart/actions';
import type { CartItem } from '@/lib/shopify/types';
import { useState } from 'react';

export function DeleteItemButton({
  item,
  optimisticUpdate
}: {
  item: CartItem;
  optimisticUpdate: any;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const merchandiseId = item.merchandise.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    try {
      optimisticUpdate(merchandiseId, 'delete');
      await removeItem(null, merchandiseId);
      setMessage('Item removed successfully');
    } catch (error) {
      console.error('Error removing item:', error);
      setMessage('Error removing item');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={isPending}
        aria-label="Remove cart item"
        className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-neutral-500 disabled:opacity-50"
      >
        <XMarkIcon className="mx-[1px] h-4 w-4 text-white dark:text-black" />
      </button>
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}
