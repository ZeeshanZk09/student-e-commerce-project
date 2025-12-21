import { User } from '@/generated/prisma/client';
import Prisma from '../prisma';
import { logError, logInfo } from './debug';

async function upsertUserToDb(user: User): Promise<User | null> {
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

    const result = await Prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name ?? null,
        email: user.email ?? null,
        image: user.image ?? null,
      },
      create: {
        id: user.id,
        name: user.name ?? 'Unknown User',
        email: user.email ?? `unknown+${user.id}@example.com`,
        image: user.image ?? null,
      },
    });

    logInfo('upsertUserToDb', { ok: true, id: result.id });
    return result;
  } catch (err: any) {
    logError('upsertUserToDb', {
      error: err?.message ?? err,
      code: err?.code ?? null,
      meta: err?.meta ?? null,
    });
    throw err;
  }
}

export { upsertUserToDb };
