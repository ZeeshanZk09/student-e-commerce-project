import Prisma from '@/lib/prisma';
import { inngest } from './client';
import { logError, logInfo } from '@/lib/helpers/debug';
import { updateUser, createUser } from '@/lib/helpers/user';

export const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-creation' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    try {
      logInfo(
        'syncUserCreation',
        'event.name=',
        event?.name,
        'event.type=',
        (event as any)?.type,
        'event.data?.type=',
        event?.data?.type,
        event?.data
      );

      const user = event?.data ?? {};

      if (!user?.id) {
        logError(
          'syncUserCreation',
          'missing user.id — cannot create/upsert row. Full event:',
          event
        );
        return;
      }
      await createUser({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email_addresses[0].email_address,
        image: user.image_url,
      });
    } catch (err) {
      // Important: decide if you want to rethrow to surface failure to Inngest
      logError('syncUserCreation', 'upsert failed', err);
      throw err;
    }
  }
);

export const syncUserUpdation = inngest.createFunction(
  { id: 'sync-user-updation' },
  { event: 'clerk/user.updated' },
  async ({ event }) => {
    logInfo(
      'syncUserUpdation',
      {
        note: 'received event',
        id: event?.id,
        name: event?.name ?? undefined,
      },
      event?.data
    );
    const user = event?.data ?? {};
    logInfo('syncUserUpdation', { extracteduser: user });

    if (!user?.id) {
      logError('syncUserUpdation', 'missing user.id — aborting. Full event:', event);
      return;
    }

    try {
      await updateUser({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      });
    } catch (err) {
      logError('syncUserUpdation', 'upsert failed', err);
      throw err;
    }
  }
);

export const syncUserDeletion = inngest.createFunction(
  { id: 'sync-user-deletion' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    logInfo(
      'syncUserDeletion',
      {
        note: 'received event',
        id: event?.id,
        name: event?.name ?? undefined,
      },
      event?.data
    );
    const user = event.data ?? {};

    if (!user?.id) {
      logError('syncUserDeletion', 'missing user.id — aborting delete. Full event:', event);
      return;
    }

    try {
      await Prisma.user.delete({
        where: { id: user.id },
      });
      logInfo('syncUserDeletion', `deleted user`);
    } catch (err: any) {
      if (err?.code === 'P2025') {
        logInfo('syncUserDeletion', `record not found to delete (P2025) for id ${user.id}`);
      } else {
        logError('syncUserDeletion', { err });
      }
    }
  }
);

export const deleteCouponOnExpiry = inngest.createFunction(
  { id: 'delete-coupon-on-expiry' },
  { event: 'app/coupon.expired' },
  async ({ event, step }) => {
    const { data } = event;
    const expiryDate = new Date(data.expires_at);
    await step.sleepUntil('wait-for-expiry', expiryDate);
    await step.run(
      'delete-coupon-from-database',
      async () => await Prisma.coupon.deleteMany({ where: { code: data?.code } })
    );
  }
);
