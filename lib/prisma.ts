// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare const global: NodeJS.Global;

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
