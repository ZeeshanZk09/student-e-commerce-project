import { User } from '@/generated/prisma/client';
import Prisma from '../prisma';
import { logError, logInfo } from './debug';

async function createUser(user: Partial<User>): Promise<User | null> {
  if (!user?.id) {
    logError('upsertUserToDb', 'no user.id to upsert; skip', user);
    return null;
  }

  try {
    function hideDbUrl(url?: string | null) {
      if (!url) return 'MISSING';
      try {
        const u = new URL(url);
        return `${u.protocol}//${u.host}/...`;
      } catch {
        return 'INVALID_URL';
      }
    }

    // right before upsert
    console.info('[DB DEBUG] process.env.DATABASE_URL =', hideDbUrl(process.env.DATABASE_URL));
    console.info(
      '[DB DEBUG] prisma client datasource:',
      typeof Prisma === 'object' ? 'exists' : 'missing'
    );

    const result = await Prisma.user.create({
      data: {
        id: user.id,
        name: user.name!,
        email: user.email!,
        image: user.image!,
      },
    });

    logInfo('createUser', { ok: true, id: result.id });
    return result;
  } catch (err: any) {
    logError('createUser', {
      error: err?.message ?? err,
      code: err?.code ?? null,
      meta: err?.meta ?? null,
    });
    throw err;
  }
}

async function updateUser(user: Partial<User>): Promise<User | null> {
  if (!user?.id) {
    logError('updateUser', 'no user.id to update; skip', user);
    return null;
  }

  try {
    const result = await Prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name!,
        email: user.email!,
        image: user.image!,
      },
    });
    logInfo('updateUser', { ok: true, id: result.id });
    return result;
  } catch (err: any) {
    logError('updateUser', {
      error: err?.message ?? err,
      code: err?.code ?? null,
      meta: err?.meta ?? null,
    });
    throw err;
  }
}

export { createUser, updateUser };
