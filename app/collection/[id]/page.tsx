import React from 'react';
import { Box } from '@mui/material';
import { CollectionTitleCard } from './components/CollectionTitleCard';
import { TransactionHistoryTable } from './components/TransactionHistoryTable';
import { UnpaidChildrenGrid } from './components/UnpaidChildrenGrid';
import db from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { format } from 'date-fns';
import path from 'path';
import { auth } from '@/lib/auth';
import { Transaction } from './actions/actions';

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
          memberships: {
            include: {
              children: true,
            },
          },
        },
      },
    },
  });

  if (!collection) notFound();

  const membership = collection.class.memberships.find((m) => m.userId === session.user?.id);

  if (!membership) throw new Error('Unauthorized');

  const withdrawals = await db.withdrawal.findMany({
    where: { collectionId: id },
    include: {
      collectedBy: true,
    },
  });

  const payments = await db.payment.findMany({
    where: { collectionId: id },
    include: {
      payer: true,
      child: true,
    },
  });

  const invoices = await db.invoice.findMany({
    where: { collectionId: id },
    select: {
      id: true,
      fileUrl: true,
    },
  });

  const withdrawalTransactions: Transaction[] = withdrawals.map((w) => ({
    id: w.id,
    type: 'WITHDRAWAL',
    parent: w.collectedBy.name || 'Skarbnik',
    child: '-',
    amount: -Number(w.amount),
    date: format(w.createdAt, 'dd.MM.yyyy HH:mm'),
    rawDate: w.createdAt,
  }));

  const paymentTransactions: Transaction[] = payments.map((p) => ({
    id: p.id,
    type: 'PAYMENT',
    parent: p.payer.name || 'Rodzic',
    child: p.child.name,
    amount: Number(p.amount),
    date: format(p.paidAt, 'dd.MM.yyyy HH:mm'),
    rawDate: p.paidAt,
  }));

  const transactions = [...paymentTransactions, ...withdrawalTransactions].sort(
    (a, b) => b.rawDate.getTime() - a.rawDate.getTime(),
  );

  const isTreasurer = membership.userRole === 'TREASURER';

  const attachmentsList = invoices.map((i) => ({
    id: i.id,
    label: path.basename(i.fileUrl),
  }));

  const allChildren = collection.class.memberships.flatMap((m) => m.children);

  const costPerChild = Number(collection.amountPerChild);
  const childrenCount = allChildren.length;

  const raised = payments.length * costPerChild;
  const goal = childrenCount * costPerChild;

  const paidChildIds = new Set(payments.map((p) => p.childId));

  const unpaidChildren = allChildren
    .filter((child) => !paidChildIds.has(child.id))
    .map((child) => ({
      id: child.id,
      name: child.name,
      avatarUrl: child.avatarUrl || '',
    }));

  return (
    <Box p={4} maxWidth={900} margin="auto" display="flex" flexDirection="column" gap={4}>
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
      <TransactionHistoryTable transactions={transactions} />

      {/* Unpaid children */}
      <UnpaidChildrenGrid unpaidChildren={unpaidChildren} />
    </Box>
  );
}
