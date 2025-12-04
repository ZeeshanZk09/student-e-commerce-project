'use client';
import { useClerk, UserButton, useUser } from '@clerk/nextjs';
import { ListOrdered, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function NavClientDesktop({ userId }: { userId: string | null }) {
  const { openSignIn } = useClerk();
  const [user, setUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      setUser(true);
    } else {
      setUser(false);
    }
  }, []);

  return (
    <>
      {user ? (
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Action
              labelIcon={<ListOrdered size={16} />}
              label='My Orders'
              onClick={() => router.push('/orders')}
            />
          </UserButton.MenuItems>
        </UserButton>
      ) : (
        <button
          onClick={() => openSignIn()}
          className='px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full'
        >
          Login
        </button>
      )}
    </>
  );
}

export default function NavClientMobile({ userId }: { userId: string | null }) {
  const { openSignIn } = useClerk();
  const [user, setUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      setUser(true);
    } else {
      setUser(false);
    }
  }, []);

  return (
    <div className='sm:hidden'>
      {user ? (
        <>
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                labelIcon={<ShoppingCart size={16} />}
                label='Cart'
                onClick={() => router.push('/cart')}
              />
            </UserButton.MenuItems>
            <UserButton.MenuItems>
              <UserButton.Action
                labelIcon={<ListOrdered size={16} />}
                label='My Orders'
                onClick={() => router.push('/orders')}
              />
            </UserButton.MenuItems>
          </UserButton>
        </>
      ) : (
        <button
          onClick={() => openSignIn()}
          className='px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full'
        >
          Login
        </button>
      )}
    </div>
  );
}
