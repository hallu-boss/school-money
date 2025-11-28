import React from 'react';
import { Box, Button } from '@mui/material';
import { CollectionTitleCard } from './components/CollectionTitleCard';
import {
  TransactionHistoryRow,
  TransactionHistoryTable,
} from './components/TransactionHistoryTable';
import { ChildData, ChildrenGrid, ChildStatus } from './components/ChildrenGrid';
import db from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { format } from 'date-fns';
import path from 'path';
import { auth } from '@/lib/auth';
interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const session = await auth();
  if (!session) redirect('/sign-in');

  const { id } = await params;

  const collection = await db.collection.findUnique({
    where: { id: id },
    include: {
      class: {
        include: {
          memberships: true
        },
      },
    },
  });

  if (!collection) notFound();

  const membership = collection.class.memberships.find((m) => m.userId === session.user?.id);

  if (!membership) throw new Error('Unauthorized');

  const isTreasurer = membership.userRole === 'TREASURER';

  const invoices = await db.invoice.findMany({
    where: { collectionId: id },
    select: {
      id: true,
      fileUrl: true,
    },
  });

  const transactions = await db.transaction.findMany({
    where: { collectionId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      child: true,
    },
  });

  const participants = await db.collectionParticipant.findMany({
    where: { collectionId: id },
    include: {
      child: true,
      payments: { orderBy: { createdAt: 'asc' } },
    },
  });

  const attachmentsList = invoices.map((i) => ({
    id: i.id,
    label: path.basename(i.fileUrl),
  }));

  const allChildren = participants.filter((p) => p.isActive).map((p) => p.child);

  const costPerChild = Number(collection.amountPerChild);
  const childrenCount = allChildren.length;

  const numOfPayments = participants.map((p) => p.payments[p.payments.length - 1]).filter((p) => p?.status === "COMPLETED").length;

  const raised = numOfPayments * costPerChild;
  const goal = childrenCount * costPerChild;

  return (
    <Box p={4} maxWidth={900} margin="auto" display="flex" flexDirection="column" gap={4}>
      {isTreasurer && (
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" color="primary">
            Wypłać pieniądze
          </Button>

          <Button variant="outlined" color="error">
            Zamknij zbiórkę
          </Button>

          <Button variant="outlined" color="primary">
            Wpłać pieniądze
          </Button>
        </Box>
      )}

      {/* Header + Cover */}
      <CollectionTitleCard
        coverImage={collection.coverUrl}
        title={collection.title}
        start={format(collection.createdAt, 'dd.MM.yyyy')}
        end={format(collection.endAt, 'dd.MM.yyyy')}
        raised={raised}
        goal={goal}
        description={collection.description ? collection.description : ''}
        attachments={attachmentsList}
        editable={isTreasurer}
      />

      {/* Transaction History */}
      <TransactionHistoryTable
        transactions={transactions.map(
          (t): TransactionHistoryRow => ({
            id: t.id,
            user: t.user.name ?? 'Unnamed',
            desc: t.title,
            amount: Number(t.amount) * (t.type === 'WITHDRAWAL' ? -1 : 1),
            date: format(t.createdAt, 'dd.MM.yyyy HH:mm'),
          }),
        )}
      />

      {/* Unpaid children */}
      <ChildrenGrid
        childrenData={participants.map((p): ChildData => {
          const lastPayment = p.payments[p.payments.length - 1];
          const status: ChildStatus = !p.isActive
            ? 'SIGNED_OFF'
            : lastPayment?.status === 'COMPLETED'
              ? 'PAID'
              : 'UNPAID';
          return {
            ...p.child,
            status,
          };
        })}
      />
    </Box>
  );
}
