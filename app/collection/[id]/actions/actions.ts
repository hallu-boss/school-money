'use server';
import db from '@/lib/db';
import { TransactionType } from '@prisma/client';
import { currentCollectionId } from './collection';
import { performTransaction } from '@/lib/utils/transaction';
import { auth } from '@/lib/auth';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export const changeCollectionCover = async (file: File) => {
  if (!currentCollectionId) throw new Error('Undefined Collection');
  if (file.size == 0) return;
  const userDir = path.join(process.cwd(), 'public', 'uploads', 'collection', currentCollectionId);
  await mkdir(userDir, { recursive: true });

  const timestamp = Date.now();
  const ext = path.extname(file.name) || '.jpg';
  const fileName = `cover_${timestamp}${ext}`;
  const filePath = path.join(userDir, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filePath, buffer);

  await db.collection.update({
    where: { id: currentCollectionId },
    data: { coverUrl: `/uploads/collection/${currentCollectionId}/${fileName}` }
  })
};

export const updateCollectionDescription = async (newDescription: string) => {
  if (!currentCollectionId) throw new Error('Undefined Collection');

  await db.collection.update({
    where: { id: currentCollectionId },
    data: { description: newDescription },
  });
};

export const updateCollectionTitle = async (newTitle: string) => {
  if (!currentCollectionId) throw new Error('Undefined Collection');

  await db.collection.update({
    where: { id: currentCollectionId },
    data: { title: newTitle },
  });
};

export const deleteAttachment = async (invoiceId: string) => {
  await db.invoice.delete({
    where: { id: invoiceId }
  })
};

export const downloadAttachment = async () => {};

export const uploadAttachment = async (file: File) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  if (!currentCollectionId) throw new Error('Undefined Collection');

  if (file.size == 0) return;
  const userDir = path.join(process.cwd(), 'public', 'uploads', 'collection', currentCollectionId, 'invoices');
  await mkdir(userDir, { recursive: true });

  const filePath = path.join(userDir, file.name);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filePath, buffer);

  await db.invoice.create({
    data: {
      createdById: session.user.id,
      collectionId: currentCollectionId,
      fileUrl: `uploads/collection/${currentCollectionId}/invoices/${file.name}`,
      description: ""
    }
  })
};

export const withdrawFromCollection = async (
  fromCollectionId: string,
  toAccountId: string,
  amount: number,
) => {};

export const closeCollection = async (collectionId: string) => {};

export const payForParticipant = async (participantId: string) => {
  const session = await auth();
  if (!session || !session.user?.id) throw new Error('Unauthorized');
  if (!currentCollectionId) throw new Error('Undefined Collection');

  const collection = await db.collection.findUniqueOrThrow({
    where: { id: currentCollectionId },
  });

  if (!collection.bankAccountId) throw new Error('Collection: No bank account');

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user?.id },
  });

  if (!user.bankAccountId) throw new Error('User: No bank account');

  const participant = await db.collectionParticipant.findUniqueOrThrow({
    where: { id: participantId },
    include: {
      child: true,
    },
  });

  if (!participant) throw new Error('No participant');

  const childName = participant.child.name;

  const transaction = await performTransaction(
    TransactionType.PAYMENT,
    `Opłata za ${childName}`,
    user.bankAccountId,
    collection?.bankAccountId,
    collection.amountPerChild,
    session.user?.id,
  );

  await db.transaction.update({
    where: { id: transaction.id },
    data: {
      childId: participant.childId,
      collectionId: collection.id,
    },
  });

  const payment = await db.payment.create({
    data: {
      participantId: participant.id,
      transactionId: transaction.id,
    },
  });

  return payment;
};
