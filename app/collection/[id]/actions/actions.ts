'use server';
import db from '@/lib/db';
import { TransactionType } from '@prisma/client';
import { currentCollectionId } from './collection';
import { performTransaction } from '@/lib/utils/transaction';
import { auth } from '@/lib/auth';

export const changeCollectionCover = async () => {};

export const updateCollectionDescription = async (newDescription: string) => {};

export const updateCollectionTitle = async (newTitle: string) => {};

export const deleteAttachment = async () => {};

export const downloadAttachment = async () => {};

export const uploadAttachment = async () => {};

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
