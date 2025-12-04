'use server';
import Prisma from '@/lib/prisma';

async function authAdmin(userId: string) {
  try {
    const admin = await Prisma.user.findUnique({ where: { id: userId } });
    const isSuperAdmin =
      admin?.email === 'mzeeshankhan0988@gmail.com' ||
      admin?.email === 'apnacampus.it@gmail.com' ||
      admin?.email === 'dr5269139@gmail.com';

    console.log('iAdmin', isSuperAdmin);

    await Prisma.user.update({
      where: { id: userId },
      data: {
        role: isSuperAdmin ? 'ADMIN' : 'CUSTOMER',
      },
    });
    const isAdmin = admin?.role === 'ADMIN' ? admin : false;
    return isAdmin;
  } catch (error) {
    console.log('auth admin: ', error);
    return false;
  }
}

export { authAdmin };
