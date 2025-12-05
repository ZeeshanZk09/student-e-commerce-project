'use client';
import { Store as StoreType, User } from '@/generated/prisma/browser';
import { useClerk, UserButton } from '@clerk/nextjs';
import { ListOrdered, Shield, ShoppingCart, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

export function NavClientDesktop({
  userId,
  actionDebounce = 600,
  isAdmin,
  isSeller,
}: {
  userId: string | null;
  actionDebounce?: number;
  isAdmin?: User | false;
  isSeller?: { store: StoreType; storeId: string } | false;
}) {
  const { openSignIn } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (userId !== undefined) {
      timer = setTimeout(() => setLoading(false), actionDebounce);
    }

    return () => clearTimeout(timer);
  }, [userId, actionDebounce]);

  const handleNavigation = (path: string) => {
    if (isPending) return;
    startTransition(() => {
      router.push(path);
    });
  };

  if (loading)
    return <div className='w-8 h-8 bg-slate-200 rounded-full animate-pulse' aria-hidden />;

  if (!userId)
    return (
      <button
        onClick={() => openSignIn()}
        className='px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full'
      >
        Login
      </button>
    );

  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action
          labelIcon={<ListOrdered size={16} />}
          label='My Orders'
          onClick={() => handleNavigation('/orders')}
        />
        {isAdmin && (
          <UserButton.Action
            labelIcon={<Shield size={16} />}
            label='Admin Dashboard'
            onClick={() => handleNavigation('/admin')}
          />
        )}
        {isSeller && (
          <UserButton.Action
            labelIcon={<Store size={16} />}
            label='Seller Dashboard'
            onClick={() => handleNavigation('/store')}
          />
        )}
      </UserButton.MenuItems>
    </UserButton>
  );
}

export default function NavClientMobile({
  userId,
  actionDebounce = 600,
  isAdmin,
  isSeller,
}: {
  userId: string | null;
  actionDebounce?: number;
  isAdmin?: User | false;
  isSeller?: { store: StoreType; storeId: string } | false;
}) {
  const { openSignIn } = useClerk();
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (userId !== undefined) {
      timer = setTimeout(() => setLoading(false), actionDebounce);
    }

    return () => clearTimeout(timer);
  }, [userId, actionDebounce]);

  const handleNavigation = (path: string) => {
    if (isPending) return;
    startTransition(() => {
      router.push(path);
    });
  };

  if (loading) {
    return (
      <div className='sm:hidden w-8 h-8 bg-slate-200 rounded-full animate-pulse' aria-hidden />
    );
  }

  // 2. Login button if no user
  if (!userId) {
    return (
      <button
        onClick={() => openSignIn()}
        className='sm:hidden px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed'
        disabled={isPending}
      >
        Login
      </button>
    );
  }

  return (
    <div className='sm:hidden'>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            labelIcon={<ShoppingCart size={16} />}
            label='Cart'
            onClick={() => handleNavigation('/cart')}
          />
          <UserButton.Action
            labelIcon={<ListOrdered size={16} />}
            label='My Orders'
            onClick={() => handleNavigation('/orders')}
          />
          {isAdmin && (
            <UserButton.Action
              labelIcon={<Shield size={16} />}
              label='Admin Dashboard'
              onClick={() => handleNavigation('/admin')}
            />
          )}
          {isSeller && (
            <UserButton.Action
              labelIcon={<Store size={16} />}
              label='Seller Dashboard'
              onClick={() => handleNavigation('/store')}
            />
          )}
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
}
