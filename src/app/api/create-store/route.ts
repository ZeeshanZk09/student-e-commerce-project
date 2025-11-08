import { NextRequest } from 'next/server';
import imageKit from '../../../../config/imageKit';
import { sendErrorResponse, sendSuccessResponse } from '@/utils/sendResponse';
import { ImageKitUploadNetworkError } from '@imagekit/next';
import Prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return sendErrorResponse(401, 'Unauthorized');

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response('Invalid content type', { status: 400 });
    }
    const fd = await request.formData();

    const username = fd.get('username') as string;
    const name = fd.get('name') as string;
    const description = fd.get('description') as string;
    const email = fd.get('email') as string;
    const contact = fd.get('contact') as string;
    const address = fd.get('address') as string;
    const logoFile = fd.get('logo') as File;

    if (!username || !name || !description || !email || !contact || !address || !logoFile) {
      return sendErrorResponse(400, 'All fields are required');
    }
    // multiple-store => multi vendor app => e-commerce marketplace and user => seller store => 1 user can have one store
    const existingStore = await Prisma.store.findUnique({
      where: { userId },
    });
    if (existingStore) return sendErrorResponse(400, 'User already has a store');

    const isUsernameTaken = await Prisma.store.findUnique({
      where: { username },
    });
    if (isUsernameTaken) return sendErrorResponse(400, 'Username is already taken');

    // Upload logo to ImageKit

    const fileBuffer = Buffer.from(await logoFile.arrayBuffer());

    const response = await imageKit.upload({
      file: fileBuffer,
      fileName: logoFile.name,
      folder: 'e-com/store-logos',
    });

    const createStore = await Prisma.store.create({
      data: {
        userId,
        name,
        description,
        username,
        email,
        contact,
        address,
        logo: response.url,
      },
    });

    sendSuccessResponse(200, 'Store created successfully', createStore);
  } catch (err: any) {
    if (err instanceof ImageKitUploadNetworkError) sendErrorResponse(400, 'Image upload failed');
    console.error('[API] error', err);

    // detect Neon/Prisma network/connect-timeout errors (relaxed check)
    const isNetworkErr =
      err?.message?.includes('fetch failed') ||
      err?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
      err?.name === 'NeonDbError' ||
      err?.code === 'ENOTFOUND';

    if (isNetworkErr) {
      return sendErrorResponse(503, isNetworkErr ? 'Service Unavailable' : err.message);
    }
    return sendErrorResponse(500, err instanceof Error ? err.message : 'Something went wrong');
  }
}

export async function GET(request: NextRequest) {
  try {
    //   token verification middleware, headers => userId
    const { userId } = getAuth(request);
    if (!userId) return sendErrorResponse(401, 'Unauthorized');
    const store = await Prisma.store.findUnique({
      where: { userId },
    });
    if (!store) return sendErrorResponse(404, 'Store not found');
    return sendSuccessResponse(200, 'Store fetched successfully', store);
  } catch (error) {}
}
