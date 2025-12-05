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
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'SELLER',
      },
      include: {
        store: true,
      },
    });

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
