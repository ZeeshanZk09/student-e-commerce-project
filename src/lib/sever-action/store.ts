'use server';

import { auth } from '@clerk/nextjs/server';
import toast from 'react-hot-toast';
import { authAdmin } from '../middlewares/authAdmin';
import Prisma from '../prisma';
async function toggleIsActive(storeId: string | undefined, isActive: boolean) {
  const { userId } = await auth();
  if (!storeId || isActive === undefined) {
    return 'Please provide all required fields';
  }
  if (!userId) {
    return 'Unauthorized';
  }
  try {
    if (!userId) {
      return 'Unauthorized';
    }

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return 'Unauthorized';
    }
    const stores = await Prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        isActive,
      },
    });

    return stores;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getStores() {
  try {
    const { userId } = await auth();

    if (!userId) {
      toast.error('Unauthorized');
      return;
    }
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      toast.error('Unauthorized');
      return;
    }

    const stores = await Prisma.store.findMany({
      where: {
        // isActive: true,
        status: 'approved',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
      },
    });
    return stores;
  } catch (error) {
    console.error('Error fetching stores:', error);
    // Fallback to dummy data if API fails
    return [];
  }
}

async function getStoreById(storeId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      toast.error('Unauthorized');
      return;
    }
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      toast.error('Unauthorized');
      return;
    }
    const store = await Prisma.store.findUnique({
      where: {
        id: storeId,
        status: 'approved',
      },
      include: {
        user: true,
      },
    });

    return store;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export { toggleIsActive, getStores, getStoreById };
