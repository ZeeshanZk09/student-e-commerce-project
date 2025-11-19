import { NextRequest, NextResponse } from 'next/server';
import { sendErrorResponse, sendSuccessResponse } from '@/utils/sendResponse';
import { getAuth } from '@clerk/nextjs/server';
import { authAdmin } from '@/lib/middlewares/authAdmin';
import Prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // products: number;
  // revenue: string;
  // orders: number;
  // stores: number;
  // allOrders: any[];
  try {
    const { userId } = getAuth(request);
    if (!userId) return sendErrorResponse(401, 'Unauthorized');

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) return sendErrorResponse(401, 'Unauthorized');

    // const productsCount = await Prisma.product.count();
    const products = await Prisma.product.findMany({
      where: {
        inStock: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        _count: true,
      },
    });

    const orders = await Prisma.order.findMany({
      where: {
        isPaid: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        _count: true,
      },
    });

    const stores = await Prisma.store.findMany({
      where: {
        status: 'approved',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        _count: true,
      },
    });

    const revenue = await Prisma.order.aggregate({
      where: {
        isPaid: true,
      },
      _sum: {
        total: true,
      },
    });
    const allOrders = await Prisma.order.findMany({
      where: {
        isPaid: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const dashboard = {
      products,
      revenue,
      orders,
      stores,
      allOrders,
    };

    return sendSuccessResponse(200, 'Admin Athourized', dashboard);
  } catch (err: any) {
    console.error('[API] error', err);
    const isNetworkErr =
      err?.message?.includes('fetch failed') ||
      err?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
      err?.name === 'NeonDbError' ||
      err?.code === 'ENOTFOUND';
    if (isNetworkErr)
      return sendErrorResponse(503, isNetworkErr ? 'Service Unavailable' : err.message);
    return sendErrorResponse(500, err instanceof Error ? err.message : 'Something went wrong');
  }
}
