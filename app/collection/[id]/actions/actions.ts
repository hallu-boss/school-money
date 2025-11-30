'use server';
import db from '@/lib/db';
import { CollectionState, PaymentStatus, TransactionType } from '@prisma/client';
import { currentCollectionId } from './collection';
import { performTransaction } from '@/lib/utils/transaction';
import { auth } from '@/lib/auth';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { Decimal } from '@prisma/client/runtime/library';

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
    data: { coverUrl: `/uploads/collection/${currentCollectionId}/${fileName}` },
  });
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
    where: { id: invoiceId },
  });
};

export const downloadAttachment = async (invoiceId: string) => {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Odczytaj plik z dysku
  const filePath = path.join(process.cwd(), 'public', invoice.fileUrl);

  try {
    const fileBuffer = await readFile(filePath);
    const fileName = path.basename(invoice.fileUrl);

    return {
      fileBuffer: fileBuffer.toString('base64'),
      fileName: fileName,
      mimeType: getMimeType(path.extname(fileName)),
    };
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error('File not found on server');
  }
};

function getMimeType(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

export const uploadAttachment = async (file: File) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  if (!currentCollectionId) throw new Error('Undefined Collection');

  if (file.size == 0) return;
  const userDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'collection',
    currentCollectionId,
    'invoices',
  );
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
      description: '',
    },
  });
};

export const withdrawFromCollection = async (
  collectionId: string,
  userId: string,
  amount: number,
  title: string,
) => {
  const collection = await db.collection.findUniqueOrThrow({ where: { id: collectionId } });
  if (!collection.bankAccountId) throw new Error('Collection does not have bank account');
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.bankAccountId) throw new Error('User does not have bank account');
  const transaction = await performTransaction(
    TransactionType.WITHDRAWAL,
    title,
    collection.bankAccountId,
    user.bankAccountId,
    new Decimal(amount),
    userId,
  );
  await db.transaction.update({
    where: { id: transaction.id },
    data: { collectionId },
  });
};

export const depositToCollection = async (
  collectionId: string,
  userId: string,
  amount: number,
  title: string,
) => {
  const collection = await db.collection.findUniqueOrThrow({ where: { id: collectionId } });
  if (!collection.bankAccountId) throw new Error('Collection does not have bank account');
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.bankAccountId) throw new Error('User does not have bank account');
  const transaction = await performTransaction(
    TransactionType.TREASURER_DEPOSIT,
    title,
    user.bankAccountId,
    collection.bankAccountId,
    new Decimal(amount),
    userId,
  );

  await db.transaction.update({
    where: { id: transaction.id },
    data: { collectionId },
  });
};

export const cancelCollection = async (collectionId: string, userId: string) => {
  const withdrawalSum = await db.transaction.aggregate({
    where: {
      collectionId,
      type: 'WITHDRAWAL',
    },
    _sum: {
      amount: true,
    },
  });

  const depositSum = await db.transaction.aggregate({
    where: {
      collectionId,
      type: 'TREASURER_DEPOSIT',
    },
    _sum: {
      amount: true,
    },
  });

  // Obliczenie różnicy
  const withdrawalTotal = withdrawalSum._sum.amount || new Decimal(0);
  const depositTotal = depositSum._sum.amount || new Decimal(0);
  const difference = withdrawalTotal.minus(depositTotal).toNumber();

  if (difference !== 0) throw new Error('Unregulated collection');

  const payments = await db.payment.findMany({
    where: {
      participant: {
        collectionId: collectionId,
      },
      refundTransactionId: null,
    },
    include: {
      participant: {
        include: {
          child: true,
        },
      },
      transaction: true,
    },
  });

  await Promise.all(
    payments.map((payment) => refundPayment(payment.id, TransactionType.COLLECTION_REFUND, userId)),
  );

  await db.collection.update({
    where: { id: collectionId },
    data: { state: CollectionState.CANCELLED },
  });
};

const refundPayment = async (
  paymentId: string,
  transactionType: TransactionType = TransactionType.REFUND,
  userId: string,
) => {
  const payment = await db.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: {
      transaction: true,
      participant: {
        include: {
          child: true,
        },
      },
    },
  });
  if (!payment.transaction.toAccountId || !payment.transaction.fromAccountId)
    throw new Error('No initial transaction');
  if (payment.refundTransactionId) throw new Error('Payment already refunded');

  const transaction = await performTransaction(
    transactionType,
    `Zwrot za ${payment.participant.child.name}`,
    payment.transaction.toAccountId,
    payment.transaction.fromAccountId,
    payment.transaction.amount,
    userId,
  );

  await db.transaction.update({
    where: { id: transaction.id },
    data: {
      childId: payment.participant.childId,
      collectionId: payment.participant.collectionId,
    },
  });

  await db.payment.update({
    where: { id: paymentId },
    data: {
      refundTransactionId: transaction.id,
      status: PaymentStatus.REFUNDED,
    },
  });
};

export const activateCollection = async (collectionId: string) => {
  await db.collection.update({
    where: { id: collectionId },
    data: { state: CollectionState.ACTIVE },
  });
};

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
