import { useUser } from '@clerk/nextjs';
import { inngest } from './client';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    const { user } = useUser();

    try {
    } catch (error) {}
  }
);
