'use client';

import { Store } from '@/generated/prisma/browser';
import { getStoreById, toggleIsActive } from '@/lib/sever-action/store';
import { useEffect, useState, useTransition } from 'react';
import toast from 'react-hot-toast';

export default function ToggleStatus({ storeId }: { storeId: string }) {
  const [store, setStore] = useState<Store | undefined | null>(null);
  const [isPending, startTransition] = useTransition();

  // ✅ Fetch store
  useEffect(() => {
    const fetchStore = async () => {
      const data = await getStoreById(storeId);
      setStore(data);
    };
    fetchStore();
  }, [storeId]);

  // ✅ Toggle handler
  const handleToggle = () => {
    if (!store || isPending) return;

    const nextStatus = !store.isActive;

    // ✅ Optimistic UI update
    setStore((prev) => (prev ? { ...prev, isActive: nextStatus } : prev));

    startTransition(async () => {
      const res = await toggleIsActive(store.id, nextStatus);

      if (typeof res === 'string') {
        // rollback on error
        setStore((prev) => (prev ? { ...prev, isActive: !nextStatus } : prev));
        toast.error(res);
      }
    });
  };

  return (
    <div className='flex items-center gap-3 pt-2 flex-wrap'>
      <p>Active</p>

      <label className='relative inline-flex items-center cursor-pointer'>
        <input
          type='checkbox'
          className='sr-only peer'
          checked={!!store?.isActive}
          disabled={isPending}
          onChange={handleToggle}
        />

        <div className='w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-600 transition-colors' />

        <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4' />
      </label>
    </div>
  );
}
