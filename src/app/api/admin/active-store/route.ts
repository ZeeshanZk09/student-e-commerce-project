import { NextRequest, NextResponse } from 'next/server';
import { sendErrorResponse, sendSuccessResponse } from '@/utils/sendResponse';
import { getAuth } from '@clerk/nextjs/server';
import { authAdmin } from '@/lib/middlewares/authAdmin';
import Prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return sendErrorResponse(401, 'Unauthorized');

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) return sendErrorResponse(401, 'Unauthorized');

    const stores = await Prisma.store.findMany({
      where: {
        // isActive: true,
        status: 'approved',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sendSuccessResponse(200, 'Stores', stores);
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

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return sendErrorResponse(401, 'Unauthorized');

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) return sendErrorResponse(401, 'Unauthorized');

    const { storeId, isActive } = await request.json();
    if (!storeId || !isActive) return sendErrorResponse(400, 'All fields are required');
    const stores = await Prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        isActive,
      },
    });

    return sendSuccessResponse(200, 'Stores', stores);
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
