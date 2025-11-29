import { TransactionType } from '@prisma/client';
import db from '../db';
import { Decimal } from '@prisma/client/runtime/library';

export const performTransaction = async (
  type: TransactionType,
  title: string,
  fromAccountId: string,
  toAccountId: string,
  amount: Decimal,
  userId: string,
) => {
  const fromBankAccount = await db.bankAccount.findUniqueOrThrow({
    where: { id: fromAccountId }
  });

  if (fromBankAccount.balance.lt(amount)) throw new Error("Bank Account balance to small");

  const transaction = await db.transaction.create({
    data: {
      type,
      amount,
      title,
      fromAccountId,
      toAccountId,
      userId,
    },
  });

  await db.bankAccount.update({
    where: { id: fromAccountId },
    data: { balance: { decrement: amount } },
  });

  await db.bankAccount.update({
    where: { id: toAccountId },
    data: { balance: { increment: amount } },
  });

  return transaction;
};
