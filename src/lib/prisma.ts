import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaClient } from '@/generated/prisma/client'; // error

import ws from 'ws';
neonConfig.webSocketConstructor = ws;

// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
neonConfig.poolQueryViaFetch = true; // inngest

// Type definitions
declare global {
  var GlobalPrisma: PrismaClient | undefined;
}

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaNeon({ connectionString });
const Prisma = global.GlobalPrisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV === 'development') global.GlobalPrisma = Prisma ;

export default Prisma;
export type Prisma = typeof Prisma;
