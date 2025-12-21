'use server';
import Prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

async function authAdmin(userId: string) {
  try {
    if (!userId) return false; // userId

    const admin = await Prisma.user.findUnique({ where: { id: userId } });
    const isSuperAdmin =
      admin?.email === 'mzeeshankhan0988@gmail.com' ||
      admin?.email === 'apnacampus.it@gmail.com' ||
      admin?.email === 'dr5269139@gmail.com';

    console.log('isAdmin', isSuperAdmin);

    await Prisma.user.update({
      where: { id: userId },
      data: {
        isAdmin: isSuperAdmin,
      },
    });
    const isAdmin = admin?.isAdmin ? admin : false;
    return isAdmin;
  } catch (error) {
    console.log('auth admin: ', error);
    return false;
  }
}

export { authAdmin };
