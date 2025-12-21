'use server';
import { Store } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

export default async function authSeller(userId: string): Promise<
  | {
      store: Store;
      storeId: string;
    }
  | false
> {
  try {
    if (!userId) return false;
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        isSeller: true,
      },
      include: {
        store: true,
      },
    });
    console.log('user is seller or not check-in server: ', user);
    if (user?.store) {
      if (user.store.status === 'approved' && user.store.isActive) {
        return {
          store: user.store,
          storeId: user.store.id,
        };
      }
      return false;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}
