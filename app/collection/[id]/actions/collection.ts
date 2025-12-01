import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { redirect, notFound } from 'next/navigation';

export let currentCollectionId: string | null = null;

export async function getCollectionData(collectionId: string) {
  const session = await auth();
  if (!session) redirect('/sign-in');

  const userId = session.user?.id;

  const collection = await db.collection.findUnique({
    where: { id: collectionId },
    include: {
      bankAccount: true,
      invoices: true,
      transactions: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          child: true,
        },
      },
      participants: {
        include: {
          child: true,
          payments: { orderBy: { createdAt: 'asc' } },
        },
      },
      class: {
        include: {
          memberships: true,
        },
      },
    },
  });

  if (!collection) notFound();
  if (!collection.class.memberships.find((m) => m.userId === userId))
    throw new Error('Unauthorized');

  currentCollectionId = collectionId;
  return collection;
}
